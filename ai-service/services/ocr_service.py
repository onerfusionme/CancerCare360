import fitz  # PyMuPDF
from typing import Dict, Any

def extract_text_from_pdf(file_bytes: bytes) -> Dict[str, Any]:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        return {"error": str(e), "text": "", "page_count": 0}

    text_per_page = {}
    full_text = ""
    metadata = doc.metadata
    page_count = doc.page_count
    
    total_chars = 0

    for i in range(page_count):
        page = doc.load_page(i)
        page_text = page.get_text()
        text_per_page[f"page_{i+1}"] = page_text
        full_text += page_text + "\n"
        total_chars += len(page_text)

    is_low_density = total_chars / page_count < 100 if page_count > 0 else True
    doc.close()

    return {
        "page_count": page_count,
        "text_per_page": text_per_page,
        "metadata": metadata,
        "full_text": full_text,
        "is_low_density": is_low_density
    }
