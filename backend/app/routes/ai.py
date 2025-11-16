from fastapi import APIRouter, Depends, HTTPException, status

from ..config import Settings, get_settings
from ..schemas import ChatRequest, ChatResponse
from ..services.grok import GrokClient

router = APIRouter()


def _client(settings: Settings) -> GrokClient:
    return GrokClient(api_key=settings.grok_api_key, model=settings.grok_model)


@router.post("/chat", response_model=ChatResponse)
async def chat_with_grok(payload: ChatRequest, settings: Settings = Depends(get_settings)) -> ChatResponse:
    client = _client(settings)
    try:
        reply = await client.chat(message=payload.message, image_url=payload.image_url)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return ChatResponse(reply=reply, model=settings.grok_model)
