"""Freeform AI chat for the Mutual NDA.

The AI asks the user about the document's fields and returns, alongside its
reply, the subset of fields it could extract from the conversation so far.
The frontend merges these into the document it already holds and keeps the
full message history, so this endpoint is stateless.
"""

from typing import Literal

from fastapi import APIRouter, HTTPException
from litellm import completion
from openai import APIError
from pydantic import BaseModel, ValidationError

router = APIRouter(prefix="/api/chat", tags=["chat"])

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a helpful legal assistant guiding a user through \
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
unknown. Keep replies concise and ask for the next missing piece of \
information."""


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


class ChatTurnResult(BaseModel):
    reply: str
    fields: NdaFields


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@router.post("")
def chat(request: ChatRequest) -> ChatTurnResult:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + [
        {"role": message.role, "content": message.content}
        for message in request.messages
    ]

    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=ChatTurnResult,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        result = response.choices[0].message.content
        return ChatTurnResult.model_validate_json(result)
    except (APIError, ValidationError) as error:
        raise HTTPException(
            status_code=502, detail="The AI assistant is unavailable right now."
        ) from error
