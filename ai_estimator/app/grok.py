from __future__ import annotations

import base64
import re
from typing import Optional

import httpx

from .config import Settings
from .schemas import VisionDiagnostics


def _encode_image(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


def _clamp_days(value: int, max_days: int) -> int:
    return max(1, min(value, max_days))


class GrokClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def estimate_expiry_days(
        self, image_url: str, image_bytes: bytes, diagnostics: VisionDiagnostics
    ) -> Optional[int]:
        if not self.settings.grok_api_url or not self.settings.grok_api_key:
            return None

        payload = self._build_payload(image_url, image_bytes, diagnostics)
        headers = {"Authorization": f"Bearer {self.settings.grok_api_key}"}

        async with httpx.AsyncClient(timeout=self.settings.inference_timeout) as client:
            response = await client.post(self.settings.grok_api_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        extracted = self._extract_days(data)
        return _clamp_days(extracted, self.settings.max_shelf_life_days) if extracted else None

    def _build_payload(self, image_url: str, image_bytes: bytes, diagnostics: VisionDiagnostics) -> dict:
        encoded_image = _encode_image(image_bytes)
        prompt = (
            "You are estimating how soon food should be consumed. "
            "If you find a date in the picture, convert it into how many days remain from today. "
            "If no date is visible, make a conservative guess based on whether the item looks fresh, canned, or packaged. "
            f"Brightness: {diagnostics.brightness}, Contrast: {diagnostics.contrast}, Text regions: {diagnostics.text_regions}. "
            "Answer only with an integer number of days, no extra text."
        )

        return {
            "model": self.settings.grok_model,
            "messages": [
                {"role": "system", "content": "You return expiry estimates in integer days."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "input_image", "image_url": image_url},
                        {"type": "input_image", "image_base64": encoded_image},
                    ],
                },
            ],
            "stream": False,
        }

    def _extract_days(self, payload: dict) -> Optional[int]:
        if "estimated_days" in payload and isinstance(payload["estimated_days"], int):
            return payload["estimated_days"]

        choices = payload.get("choices")
        if isinstance(choices, list) and choices:
            content = choices[0].get("message", {}).get("content")
            if isinstance(content, str):
                match = re.search(r"(-?\d+)", content)
                if match:
                    return int(match.group(1))

        return None
