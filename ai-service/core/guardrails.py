import re
from typing import Tuple, List

FORBIDDEN_PATTERNS = [
    r"patient has (carcinoma|cancer|tumor)",
    r"administer .*(mg|auc|mcg)",
    r"prognosis.*(months|years|weeks)",
    r"survival.*(rate|probability)"
]

DISCLAIMER = "CLINICAL DECISION SUPPORT ONLY. This summary is generated from verified records and does not replace professional clinical judgement. Verification by treating oncologist required."

def verify_safety(text: str) -> Tuple[bool, List[str]]:
    violations = []
    text_lower = text.lower()
    
    for pattern in FORBIDDEN_PATTERNS:
        if re.search(pattern, text_lower):
            violations.append(f"Forbidden autonomous clinical statement matched pattern: {pattern}")
            
    return len(violations) == 0, violations

def apply_guardrails(text: str) -> str:
    is_safe, violations = verify_safety(text)
    if not is_safe:
        raise ValueError(f"Safety violations detected: {', '.join(violations)}")
    
    return f"{text}\n\n{DISCLAIMER}"

def calculate_confidence_score(base_score: float, required_fields_found: int, total_required_fields: int) -> float:
    if total_required_fields == 0:
        return base_score
    coverage = required_fields_found / total_required_fields
    return base_score * 0.7 + coverage * 0.3
