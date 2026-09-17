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


def test_chat_returns_reply_and_extracted_fields(client, monkeypatch):
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
            "messages": [
                {"role": "user", "content": "We want to explore a partnership"}
            ]
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
            "messages": [
                {"role": "user", "content": "hello"},
                {"role": "assistant", "content": "hi there"},
                {"role": "user", "content": "our company is Acme"},
            ]
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
