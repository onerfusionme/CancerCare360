from core.guardrails import apply_guardrails

def explain_care_gap(gap_type: str, gap_data: dict) -> dict:
    if gap_type == "MISSED_CHEMO":
        explanation = f"Patient has missed chemotherapy cycle #{gap_data.get('cycle_number', 'X')} by {gap_data.get('days_delayed', 'Y')} days without a documented delay reason or rescheduling."
    elif gap_type == "MISSING_LABS":
        explanation = f"Required lab tests ({gap_data.get('labs', 'CBC')}) are missing before the upcoming treatment."
    else:
        explanation = f"Care gap flagged: {gap_type}. Please review patient records."
        
    safe_explanation = apply_guardrails(explanation)
    return {"explanation": safe_explanation}
