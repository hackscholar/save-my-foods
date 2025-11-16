from fastapi import Depends, FastAPI, HTTPException, status

from .config import Settings, get_settings
from .grok import GrokClient
from .schemas import EstimateRequest, EstimateResponse
from .vision import analyze_image, download_image_bytes, fallback_expiry_days

app = FastAPI(title="Save My Foods AI Estimator", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/estimate", response_model=EstimateResponse)
async def estimate_expiry(
    payload: EstimateRequest, settings: Settings = Depends(get_settings)
) -> EstimateResponse:
    image_bytes = await download_image_bytes(payload.image_url, timeout=settings.download_timeout)
    diagnostics, _ = analyze_image(image_bytes)

    grok_client = GrokClient(settings)
    grok_days = None
    try:
        grok_days = await grok_client.estimate_expiry_days(payload.image_url, image_bytes, diagnostics)
    except Exception as exc:  # pragma: no cover - defensive catch to avoid leaking details
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Grok estimation failed") from exc

    if grok_days:
        return EstimateResponse(
            estimated_days=grok_days, source="grok", notes="Grok-derived estimate", vision=diagnostics
        )

    heuristic_days = fallback_expiry_days(
        diagnostics=diagnostics,
        default_shelf_life=settings.default_shelf_life_days,
        max_days=settings.max_shelf_life_days,
    )
    return EstimateResponse(
        estimated_days=heuristic_days,
        source="heuristic",
        notes="Fallback OpenCV heuristics (no Grok response)",
        vision=diagnostics,
    )
