import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from app.services.qr_scanner import scan_qr_image
from app.api.v1.endpoints.auth import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB limit

@router.post("/scan/qr")
async def scan_qr_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Upload and decode a QR code image to evaluate security risks safely.
    Never visits or automatically opens any extracted URLs.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded. Please upload a QR code image.")

    filename = file.filename or "unknown_qr.png"
    content_type = file.content_type or ""

    # Validate image extension and content type
    allowed_extensions = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".tiff")
    if not (content_type.startswith("image/") or any(filename.lower().endswith(ext) for ext in allowed_extensions)):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a valid image file (PNG, JPG, JPEG, WEBP)."
        )

    try:
        file_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded QR image: {e}")
        raise HTTPException(status_code=400, detail="Failed to read the uploaded image file.")

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum size limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    result = scan_qr_image(file_bytes, filename=filename)

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to process QR code."))

    return result
