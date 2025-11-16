from __future__ import annotations

from typing import Tuple

import cv2
import httpx
import numpy as np
from fastapi import HTTPException, status

from .schemas import VisionDiagnostics


async def download_image_bytes(url: str, timeout: float) -> bytes:
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(url)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail="Unable to download image") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid image URL or unreachable host") from exc

    return response.content


def _decode_image(image_bytes: bytes) -> np.ndarray:
    buffer = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Provided file is not a valid image")
    return image


def _estimate_text_regions(binary_mask: np.ndarray) -> int:
    contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    large_boxes = 0
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 20 and h > 10:
            large_boxes += 1
    return large_boxes


def analyze_image(image_bytes: bytes) -> Tuple[VisionDiagnostics, np.ndarray]:
    image = _decode_image(image_bytes)
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    brightness = float(np.mean(grayscale) / 255)
    contrast = float(np.std(grayscale) / 255)

    _, binary = cv2.threshold(grayscale, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    text_regions = _estimate_text_regions(binary)
    ink_ratio = float(np.mean(binary) / 255)

    diagnostics = VisionDiagnostics(
        brightness=round(brightness, 3),
        contrast=round(contrast, 3),
        text_regions=text_regions,
        ink_ratio=round(ink_ratio, 3),
    )
    return diagnostics, image


def fallback_expiry_days(diagnostics: VisionDiagnostics, default_shelf_life: int, max_days: int) -> int:
    score = default_shelf_life

    if diagnostics.text_regions == 0 and diagnostics.ink_ratio < 0.02:
        score = max(1, default_shelf_life - 1)
    if diagnostics.contrast < 0.05:
        score = max(score - 1, 1)
    if diagnostics.brightness > 0.8:
        score = max(1, score - 1)

    return min(score, max_days)
