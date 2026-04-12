from __future__ import annotations

import re


def compute_confidence(
    model_confidence: float,
    value: str,
    field_type: str,
) -> float:
    """
    Adjust the model's self-reported confidence with heuristic validation.
    Returns a final confidence score between 0.0 and 1.0.
    """
    if not value or value.strip() == "":
        return 0.0

    base = max(0.0, min(1.0, model_confidence))
    penalty = 0.0

    if field_type == "money":
        cleaned = re.sub(r"[,$\s]", "", value)
        cleaned = re.sub(r"[A-Za-z]+", "", cleaned).strip()
        cleaned = cleaned.strip("()")
        try:
            amount = float(cleaned)
            if amount < 0:
                penalty = 0.1
        except ValueError:
            penalty = 0.4

    elif field_type == "date":
        date_patterns = [
            r"\d{4}-\d{2}-\d{2}",
            r"\d{1,2}/\d{1,2}/\d{4}",
            r"[A-Za-z]+ \d{1,2},? \d{4}",
        ]
        if not any(re.search(p, value) for p in date_patterns):
            penalty = 0.2

    elif field_type == "routing_number":
        digits = re.sub(r"\D", "", value)
        if len(digits) != 9:
            penalty = 0.3

    elif field_type == "ein":
        digits = re.sub(r"\D", "", value)
        if len(digits) != 9:
            penalty = 0.25

    elif field_type == "percentage":
        cleaned = value.replace("%", "").strip()
        try:
            pct = float(cleaned)
            if pct < 0 or pct > 100:
                penalty = 0.2
        except ValueError:
            penalty = 0.3

    final = max(0.0, base - penalty)
    return round(final, 3)
