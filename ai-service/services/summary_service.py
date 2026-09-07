from core.guardrails import apply_guardrails

def generate_consultation_summary(patient_data: dict, recent_history: dict, pending_items: dict) -> dict:
    summary = f"""
Clinical Trajectory: Patient is undergoing evaluation/treatment.
Current Status: Stable.
Key Attention Points: Review recent labs and imaging.
Pending Investigations to Review: {len(pending_items.get('investigations', []))} items pending.
Recommended Agenda for Visit: Discuss treatment response and symptom management.
"""
    safe_summary = apply_guardrails(summary)
    return {"summary": safe_summary}

def generate_since_last_visit_summary(last_visit_date: str, new_events: list, new_docs: list, new_investigations: list) -> dict:
    summary = f"Since last visit on {last_visit_date}, {len(new_events)} new events, {len(new_docs)} new docs, {len(new_investigations)} new investigations reported."
    safe_summary = apply_guardrails(summary)
    return {"summary": safe_summary}

def generate_journey_summary(journey_data: dict) -> dict:
    summary = f"Patient diagnosed with {journey_data.get('diagnosis', 'condition')}. Completed {journey_data.get('completed_stages', 0)} stages. Current stage: {journey_data.get('current_stage', 'Evaluation')}."
    safe_summary = apply_guardrails(summary)
    return {"summary": safe_summary}
