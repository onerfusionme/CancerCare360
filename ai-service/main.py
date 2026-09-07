from fastapi import FastAPI, Depends, HTTPException, Security, UploadFile, File, Form, Body
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from config import settings
from services.ocr_service import extract_text_from_pdf
from services.extractor_service import extract_clinical_entities
from services.summary_service import generate_consultation_summary, generate_since_last_visit_summary, generate_journey_summary
from services.explanation_service import explain_care_gap
from services.education_draft_service import draft_patient_communication

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return api_key

@app.get("/health")
def health_check():
    return {"status": "ok", "provider": settings.MODEL_PROVIDER}

@app.post("/api/v1/extract", dependencies=[Depends(verify_api_key)])
async def extract_document(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    document_type: str = Form("auto")
):
    if file:
        file_bytes = await file.read()
        ocr_result = extract_text_from_pdf(file_bytes)
        document_text = ocr_result.get("full_text", "")
    elif text:
        document_text = text
    else:
        raise HTTPException(status_code=400, detail="Either file or text must be provided")

    result = extract_clinical_entities(document_text, document_type)
    return result

@app.post("/api/v1/summarize/consultation", dependencies=[Depends(verify_api_key)])
def summarize_consultation(payload: Dict[str, Any] = Body(...)):
    patient_data = payload.get("patient_data", {})
    recent_history = payload.get("recent_history", {})
    pending_items = payload.get("pending_items", {})
    
    result = generate_consultation_summary(patient_data, recent_history, pending_items)
    return result

@app.post("/api/v1/summarize/since-last-visit", dependencies=[Depends(verify_api_key)])
def summarize_since_last_visit(payload: Dict[str, Any] = Body(...)):
    result = generate_since_last_visit_summary(
        payload.get("last_visit_date", ""),
        payload.get("new_events", []),
        payload.get("new_docs", []),
        payload.get("new_investigations", [])
    )
    return result

@app.post("/api/v1/summarize/journey", dependencies=[Depends(verify_api_key)])
def summarize_journey(payload: Dict[str, Any] = Body(...)):
    result = generate_journey_summary(payload.get("journey_data", {}))
    return result

@app.post("/api/v1/explain/care-gap", dependencies=[Depends(verify_api_key)])
def explain_gap(payload: Dict[str, Any] = Body(...)):
    result = explain_care_gap(payload.get("gap_type", ""), payload.get("gap_data", {}))
    return result

@app.post("/api/v1/draft/education", dependencies=[Depends(verify_api_key)])
def draft_education(payload: Dict[str, Any] = Body(...)):
    result = draft_patient_communication(
        payload.get("topic", ""),
        payload.get("language", "english"),
        payload.get("key_points", [])
    )
    return result
