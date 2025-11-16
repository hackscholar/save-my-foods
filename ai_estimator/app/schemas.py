from typing import Literal, Optional

from pydantic import BaseModel, HttpUrl


class EstimateRequest(BaseModel):
    image_url: HttpUrl


class VisionDiagnostics(BaseModel):
    brightness: float
    contrast: float
    text_regions: int
    ink_ratio: float


class EstimateResponse(BaseModel):
    estimated_days: int
    source: Literal["grok", "heuristic"]
    notes: Optional[str] = None
    vision: VisionDiagnostics
