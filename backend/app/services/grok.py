from __future__ import annotations

import base64
from typing import Any

import cv2
import httpx
import numpy as np


class GrokClient:
    """Minimal Grok chat client that can include an uploaded image in the prompt."""

    def __init__(self, api_key: str | None, model: str = "grok-beta", base_url: str = "https://api.x.ai/v1") -> None:
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")

    async def chat(self, message: str, image_url: str | None = None) -> str:
        if not self.api_key:
            raise ValueError("GROK_API_KEY is not configured")

        user_content: list[dict[str, Any]] = [{"type": "text", "text": message}]

        if image_url:
            encoded_image = await self._fetch_and_encode_image(image_url)
            if encoded_image:
                user_content.append({"type": "input_image", "image": encoded_image})

        payload = {"model": self.model, "messages": [{"role": "user", "content": user_content}], "temperature": 0.2}

        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(base_url=self.base_url, timeout=30) as client:
            response = await client.post("/chat/completions", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        choices = data.get("choices", [])
        if not choices:
            raise RuntimeError("No response returned from Grok")

        first_choice = choices[0].get("message", {})
        return first_choice.get("content", "")

    async def _fetch_and_encode_image(self, image_url: str) -> str | None:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            image_bytes = response.content

        decoded = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        if decoded is None:
            return None

        success, buffer = cv2.imencode(".jpg", decoded)
        if not success:
            return None

        return base64.b64encode(buffer.tobytes()).decode("utf-8")
