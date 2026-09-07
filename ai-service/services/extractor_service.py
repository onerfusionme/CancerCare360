import re
from typing import Dict, Any

def extract_pathology_entities(text: str) -> Dict[str, Any]:
    entities = {}
    # Basic heuristic extraction
    histological_match = re.search(r"(carcinoma|sarcoma|melanoma)", text, re.IGNORECASE)
    if histological_match:
        entities["histological_type"] = histological_match.group(1)
        
    grade_match = re.search(r"grade (1|2|3|I|II|III)|(G[1-3])", text, re.IGNORECASE)
    if grade_match:
        entities["tumor_grade"] = grade_match.group(0)

    er_match = re.search(r"ER\s*:\s*(positive|negative|[\d]+%)", text, re.IGNORECASE)
    if er_match:
        entities["er_status"] = er_match.group(1)
        
    return entities

def extract_radiology_entities(text: str) -> Dict[str, Any]:
    entities = {}
    modality_match = re.search(r"(CT|MRI|PET|X-ray|Ultrasound)", text, re.IGNORECASE)
    if modality_match:
        entities["modality"] = modality_match.group(1)
        
    recist_match = re.search(r"(CR|PR|SD|PD)", text, re.IGNORECASE)
    if recist_match:
        entities["recist_category"] = recist_match.group(1)

    return entities

def extract_lab_entities(text: str) -> Dict[str, Any]:
    entities = {}
    hb_match = re.search(r"Hb\s*:?\s*([\d.]+)", text, re.IGNORECASE)
    if hb_match:
        entities["hemoglobin"] = hb_match.group(1)
        
    creatinine_match = re.search(r"creatinine\s*:?\s*([\d.]+)", text, re.IGNORECASE)
    if creatinine_match:
        entities["creatinine"] = creatinine_match.group(1)
        
    return entities

def extract_clinical_entities(text: str, document_type: str = "auto") -> Dict[str, Any]:
    text_lower = text.lower()
    if document_type == "auto":
        if "pathology" in text_lower or "biopsy" in text_lower:
            document_type = "pathology"
        elif "ct " in text_lower or "mri" in text_lower or "radiology" in text_lower:
            document_type = "radiology"
        elif "blood" in text_lower or "lab" in text_lower:
            document_type = "lab"
        else:
            document_type = "unknown"

    entities = {}
    if document_type == "pathology":
        entities = extract_pathology_entities(text)
    elif document_type == "radiology":
        entities = extract_radiology_entities(text)
    elif document_type == "lab":
        entities = extract_lab_entities(text)
        
    confidence = 0.85 if entities else 0.4
    
    return {
        "entities": entities,
        "confidence_scores": {k: confidence for k in entities.keys()},
        "raw_mentions": [],
        "document_type": document_type
    }
