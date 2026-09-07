def draft_patient_communication(topic: str, language: str, key_points: list) -> dict:
    points_str = "\n".join([f"- {p}" for p in key_points])
    
    if language.lower() == "hindi":
        draft = f"विषय: {topic}\n\nमुख्य बिंदु:\n{points_str}"
    elif language.lower() == "marathi":
        draft = f"विषय: {topic}\n\nमहत्वाचे मुद्दे:\n{points_str}"
    else:
        draft = f"Subject: {topic}\n\nKey Points:\n{points_str}"
        
    disclaimer = "This information is for guidance. Please discuss specific treatments with your care team."
    
    final_draft = f"{draft}\n\n{disclaimer}"
    return {"draft": final_draft}
