"""Freeform AI chat guiding a user through drafting any of the catalog's documents.

The first turn(s) of a conversation have no document type yet: the AI identifies
which catalog document the user wants, or explains it's unsupported and suggests
the closest one. Once a document type is resolved, the AI asks about that
document's fields one at a time, alongside its reply. The Mutual NDA keeps its
own hand-written field schema (nested party details, term options), since it
predates this generic mechanism and already has a tested UI; every other
document derives its fields directly from the `_link` spans in its template.
The frontend resends the full message history and the resolved document type
each turn, so this endpoint is stateless.
"""

from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from litellm import completion
from openai import APIError
from pydantic import BaseModel, ValidationError, create_model

from backend import documents

router = APIRouter(prefix="/api/chat", tags=["chat"])

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

FOLLOW_UP_INSTRUCTION = (
    "Before replying, check the field list above against the whole "
    "conversation so far. If any field is still unknown, your reply MUST end "
    "with a direct question asking for one of those missing fields — never "
    "end your reply with only an acknowledgement or summary. Only skip the "
    "question once every field above is known."
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    documentType: str | None = None


def _complete(
    system_prompt: str, request: ChatRequest, response_model: type[BaseModel]
) -> BaseModel:
    messages = [{"role": "system", "content": system_prompt}] + [
        {"role": message.role, "content": message.content}
        for message in request.messages
    ]
    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=response_model,
            reasoning_effort="medium",
            extra_body=EXTRA_BODY,
        )
        result = response.choices[0].message.content
        return response_model.model_validate_json(result)
    except (APIError, ValidationError) as error:
        raise HTTPException(
            status_code=502, detail="The AI assistant is unavailable right now."
        ) from error


# ---- Document selection (no document type resolved yet) ----


def _selection_system_prompt(catalog: list[documents.DocumentType]) -> str:
    listing = "\n".join(
        f"- {doc.id}: {doc.name} — {doc.description}" for doc in catalog
    )
    return (
        "You are a helpful legal assistant helping a user pick which document to "
        "create. Here are the documents you can generate:\n"
        f"{listing}\n\n"
        "Ask what they need if it's unclear. If they describe something this list "
        "doesn't cover, explain you can't generate that, but suggest the single "
        "closest document from the list and ask if they'd like to proceed with "
        "that instead — leave documentType null until they confirm. Once the user "
        "has clearly told you or confirmed which document they want, set "
        "documentType to its id. " + FOLLOW_UP_INSTRUCTION
    )


def _build_selection_model(catalog: list[documents.DocumentType]) -> type[BaseModel]:
    ids = tuple(doc.id for doc in catalog)
    return create_model(
        "SelectionResult",
        reply=(str, ...),
        documentType=(Literal[ids] | None, None),
    )


def _run_selection_turn(
    request: ChatRequest, catalog: list[documents.DocumentType]
) -> dict[str, Any]:
    model = _build_selection_model(catalog)
    result = _complete(_selection_system_prompt(catalog), request, model)
    return {"reply": result.reply, "documentType": result.documentType}


# ---- Mutual NDA (hand-written schema, unchanged since PL-6) ----

NDA_SYSTEM_PROMPT = (
    """You are a helpful legal assistant guiding a user through \
filling out a Mutual Non-Disclosure Agreement (NDA). Ask about one or a few \
related fields at a time, in a natural conversational tone. The fields to \
collect are:
- partyOne / partyTwo: company, signatoryName, title, noticeAddress (postal \
address) for each of the two parties
- purpose: why the parties are sharing confidential information
- effectiveDate: ISO date (yyyy-mm-dd) the agreement starts
- mndaTerm: "expires" (agreement ends after a fixed period) or "continues" \
(until terminated) - and mndaTermYears if "expires"
- confidentialityTerm: "fixed" (confidentiality obligation ends after a \
period) or "perpetual" - and confidentialityTermYears if "fixed"
- governingLaw: which state's law governs the agreement
- jurisdiction: city/county and state for legal disputes
- modifications: any custom modifications to the standard terms (optional)

Only return fields the user just told you or already clearly stated earlier \
in the conversation. Never invent values. Leave a field null if it is still \
unknown. Keep replies concise. """
    + FOLLOW_UP_INSTRUCTION
)


class PartyDetailsFields(BaseModel):
    company: str | None = None
    signatoryName: str | None = None
    title: str | None = None
    noticeAddress: str | None = None


class NdaFields(BaseModel):
    partyOne: PartyDetailsFields | None = None
    partyTwo: PartyDetailsFields | None = None
    purpose: str | None = None
    effectiveDate: str | None = None
    mndaTerm: Literal["expires", "continues"] | None = None
    mndaTermYears: str | None = None
    confidentialityTerm: Literal["fixed", "perpetual"] | None = None
    confidentialityTermYears: str | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None


class NdaChatTurnResult(BaseModel):
    reply: str
    fields: NdaFields


def _run_nda_turn(request: ChatRequest) -> dict[str, Any]:
    result = _complete(NDA_SYSTEM_PROMPT, request, NdaChatTurnResult)
    assert isinstance(result, NdaChatTurnResult)
    return {"reply": result.reply, "fields": result.fields.model_dump()}


# ---- Generic documents (fields derived from the template's `_link` spans) ----


def _generic_system_prompt(
    document: documents.DocumentType, field_names: list[str]
) -> str:
    listing = "\n".join(f"- {name}" for name in field_names)
    return (
        f"You are a helpful legal assistant guiding a user through filling out a "
        f"{document.name}. Ask about one or a few related fields at a time, in a "
        "natural conversational tone. The fields to collect are:\n"
        f"{listing}\n\n"
        "Only return fields the user just told you or already clearly stated "
        "earlier in the conversation. Never invent values. Leave a field null if "
        "it is still unknown. Keep replies concise. " + FOLLOW_UP_INSTRUCTION
    )


def _build_generic_model(field_names: list[str]) -> type[BaseModel]:
    slugs = {documents.slugify_field_name(name) for name in field_names}
    fields_model = create_model(
        "GenericFields", **{slug: (str | None, None) for slug in slugs}
    )
    return create_model(
        "GenericChatTurnResult", reply=(str, ...), fields=(fields_model, ...)
    )


def _run_generic_turn(
    request: ChatRequest, document: documents.DocumentType
) -> dict[str, Any]:
    field_names = documents.fields_for(document)
    model = _build_generic_model(field_names)
    result = _complete(_generic_system_prompt(document, field_names), request, model)
    return {"reply": result.reply, "fields": result.fields.model_dump()}


@router.post("")
def chat(request: ChatRequest) -> dict[str, Any]:
    catalog = documents.load_catalog()

    if request.documentType is None:
        return _run_selection_turn(request, catalog)

    if request.documentType == documents.NDA_DOCUMENT_ID:
        return _run_nda_turn(request)

    document = next((doc for doc in catalog if doc.id == request.documentType), None)
    if document is None:
        raise HTTPException(status_code=400, detail="Unknown document type.")
    return _run_generic_turn(request, document)
