import json
from types import SimpleNamespace

import httpx
from openai import APIConnectionError

from backend import chat


def _fake_completion_response(reply: str, fields: dict) -> object:
    payload = json.dumps({"reply": reply, "fields": fields})
    message = SimpleNamespace(content=payload)
    choice = SimpleNamespace(message=message)
    return SimpleNamespace(choices=[choice])


def _fake_completion_response_with(reply: str, documentType: str | None) -> object:
    payload = json.dumps({"reply": reply, "documentType": documentType})
    message = SimpleNamespace(content=payload)
    choice = SimpleNamespace(message=message)
    return SimpleNamespace(choices=[choice])


def test_chat_returns_reply_and_extracted_fields_for_the_nda(client, monkeypatch):
    def fake_completion(**kwargs):
        assert kwargs["model"] == chat.MODEL
        return _fake_completion_response(
            reply="Got it, what's Party One's company name?",
            fields={"purpose": "Evaluating a potential partnership"},
        )

    monkeypatch.setattr(chat, "completion", fake_completion)

    response = client.post(
        "/api/chat",
        json={
            "documentType": "mutual-nda",
            "messages": [
                {"role": "user", "content": "We want to explore a partnership"}
            ],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Got it, what's Party One's company name?"
    assert body["fields"]["purpose"] == "Evaluating a potential partnership"
    assert body["fields"]["partyOne"] is None


def test_chat_sends_system_prompt_and_full_history_to_the_model(client, monkeypatch):
    captured = {}

    def fake_completion(**kwargs):
        captured["messages"] = kwargs["messages"]
        return _fake_completion_response(reply="ok", fields={})

    monkeypatch.setattr(chat, "completion", fake_completion)

    client.post(
        "/api/chat",
        json={
            "documentType": "mutual-nda",
            "messages": [
                {"role": "user", "content": "hello"},
                {"role": "assistant", "content": "hi there"},
                {"role": "user", "content": "our company is Acme"},
            ],
        },
    )

    sent = captured["messages"]
    assert sent[0]["role"] == "system"
    assert sent[1] == {"role": "user", "content": "hello"}
    assert sent[2] == {"role": "assistant", "content": "hi there"}
    assert sent[3] == {"role": "user", "content": "our company is Acme"}


def test_chat_returns_a_clean_error_when_the_llm_call_fails(client, monkeypatch):
    def failing_completion(**kwargs):
        raise APIConnectionError(
            message="connection reset",
            request=httpx.Request("POST", "https://openrouter.ai"),
        )

    monkeypatch.setattr(chat, "completion", failing_completion)

    response = client.post(
        "/api/chat", json={"messages": [{"role": "user", "content": "hello"}]}
    )

    assert response.status_code == 502


def test_chat_returns_a_clean_error_when_the_model_reply_is_malformed(
    client, monkeypatch
):
    def fake_completion(**kwargs):
        message = SimpleNamespace(content="not valid json")
        choice = SimpleNamespace(message=message)
        return SimpleNamespace(choices=[choice])

    monkeypatch.setattr(chat, "completion", fake_completion)

    response = client.post(
        "/api/chat", json={"messages": [{"role": "user", "content": "hello"}]}
    )

    assert response.status_code == 502


def test_chat_with_no_document_type_runs_the_selection_prompt(client, monkeypatch):
    captured = {}

    def fake_completion(**kwargs):
        captured["messages"] = kwargs["messages"]
        return _fake_completion_response_with(
            reply="A Business Associate Agreement is the closest match. Proceed?",
            documentType=None,
        )

    monkeypatch.setattr(chat, "completion", fake_completion)

    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "I need a HIPAA contract"}]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["documentType"] is None
    assert "fields" not in body

    system_prompt = captured["messages"][0]["content"]
    assert "baa: Business Associate Agreement" in system_prompt
    assert "mutual-nda: Mutual Non-Disclosure Agreement" in system_prompt


def test_chat_selection_can_resolve_a_document_type(client, monkeypatch):
    def fake_completion(**kwargs):
        return _fake_completion_response_with(
            reply="Let's set up your BAA.", documentType="baa"
        )

    monkeypatch.setattr(chat, "completion", fake_completion)

    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "I need a BAA"}]},
    )

    assert response.status_code == 200
    assert response.json()["documentType"] == "baa"


def test_chat_runs_the_generic_path_for_a_non_nda_document(client, monkeypatch):
    captured = {}

    def fake_completion(**kwargs):
        captured["messages"] = kwargs["messages"]
        return _fake_completion_response(
            reply="What's the provider's name?",
            fields={"provider": "Acme Health"},
        )

    monkeypatch.setattr(chat, "completion", fake_completion)

    response = client.post(
        "/api/chat",
        json={
            "documentType": "baa",
            "messages": [{"role": "user", "content": "Acme Health is the provider"}],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["fields"]["provider"] == "Acme Health"
    assert "documentType" not in body

    system_prompt = captured["messages"][0]["content"]
    assert "Provider" in system_prompt
    assert "Breach Notification Period" in system_prompt


def test_chat_prompts_include_the_consistency_check_for_nda_and_generic_docs(
    client, monkeypatch
):
    captured = []

    def fake_completion(**kwargs):
        captured.append(kwargs["messages"][0]["content"])
        return _fake_completion_response(reply="ok", fields={})

    monkeypatch.setattr(chat, "completion", fake_completion)

    client.post(
        "/api/chat",
        json={
            "documentType": "mutual-nda",
            "messages": [{"role": "user", "content": "hello"}],
        },
    )
    client.post(
        "/api/chat",
        json={
            "documentType": "baa",
            "messages": [{"role": "user", "content": "hello"}],
        },
    )

    assert all(chat.CONSISTENCY_INSTRUCTION in prompt for prompt in captured)
    assert all(chat.FLEXIBILITY_INSTRUCTION in prompt for prompt in captured)


def test_chat_rejects_an_unknown_document_type(client, monkeypatch):
    response = client.post(
        "/api/chat",
        json={
            "documentType": "not-a-real-document",
            "messages": [{"role": "user", "content": "hello"}],
        },
    )

    assert response.status_code == 400
