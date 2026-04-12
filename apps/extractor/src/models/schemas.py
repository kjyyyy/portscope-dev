from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class DocumentType(str, Enum):
    CAPITAL_CALL = "CAPITAL_CALL"
    DISTRIBUTION = "DISTRIBUTION"
    NAV_STATEMENT = "NAV_STATEMENT"
    K1 = "K1"
    FUND_REPORT = "FUND_REPORT"
    UNKNOWN = "UNKNOWN"


class FieldType(str, Enum):
    MONEY = "money"
    DATE = "date"
    TEXT = "text"
    ROUTING_NUMBER = "routing_number"
    EIN = "ein"
    PERCENTAGE = "percentage"


class BBoxHighlight(BaseModel):
    page: int
    bbox: tuple[float, float, float, float]


class ExtractedField(BaseModel):
    key: str
    label: str
    value: str
    confidence: float = Field(ge=0.0, le=1.0)
    field_type: FieldType
    highlight: Optional[BBoxHighlight] = None


# ─── Request / Response ──────────────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    s3_key: str


class ClassifyResponse(BaseModel):
    document_type: DocumentType = Field(alias="documentType")
    confidence: float

    model_config = {"populate_by_name": True}


class ExtractRequest(BaseModel):
    s3_key: str
    document_type: str


class ExtractResponse(BaseModel):
    fields: list[ExtractedField]
    document_type: DocumentType = Field(alias="documentType")
    overall_confidence: float = Field(alias="overallConfidence")

    model_config = {"populate_by_name": True}


# ─── Per-document-type schemas ────────────────────────────────────────────────

CAPITAL_CALL_FIELDS: list[dict] = [
    {"key": "fund_name", "label": "Fund Name", "field_type": "text"},
    {"key": "entity_name", "label": "Entity (Recipient)", "field_type": "text"},
    {"key": "amount", "label": "Amount (USD)", "field_type": "money"},
    {"key": "due_date", "label": "Due Date", "field_type": "date"},
    {"key": "commitment_percentage", "label": "% of Commitment", "field_type": "percentage"},
    {"key": "aba_routing", "label": "ABA Routing", "field_type": "routing_number"},
    {"key": "account_name", "label": "Account Name", "field_type": "text"},
    {"key": "call_date", "label": "Call Date", "field_type": "date"},
]

DISTRIBUTION_FIELDS: list[dict] = [
    {"key": "fund_name", "label": "Fund Name", "field_type": "text"},
    {"key": "entity_name", "label": "Entity (Recipient)", "field_type": "text"},
    {"key": "amount", "label": "Distribution Amount (USD)", "field_type": "money"},
    {"key": "distribution_date", "label": "Distribution Date", "field_type": "date"},
    {"key": "distribution_type", "label": "Type", "field_type": "text"},
    {"key": "return_of_capital", "label": "Return of Capital", "field_type": "money"},
    {"key": "gain", "label": "Gain", "field_type": "money"},
]

NAV_STATEMENT_FIELDS: list[dict] = [
    {"key": "fund_name", "label": "Fund Name", "field_type": "text"},
    {"key": "entity_name", "label": "Entity", "field_type": "text"},
    {"key": "nav_value", "label": "NAV Value (USD)", "field_type": "money"},
    {"key": "as_of_date", "label": "As-of Date", "field_type": "date"},
    {"key": "total_commitment", "label": "Total Commitment", "field_type": "money"},
    {"key": "called_to_date", "label": "Called to Date", "field_type": "money"},
    {"key": "distributed_to_date", "label": "Distributed to Date", "field_type": "money"},
    {"key": "irr", "label": "IRR", "field_type": "percentage"},
    {"key": "tvpi", "label": "TVPI", "field_type": "text"},
    {"key": "dpi", "label": "DPI", "field_type": "text"},
]

K1_FIELDS: list[dict] = [
    {"key": "fund_name", "label": "Partnership Name", "field_type": "text"},
    {"key": "entity_name", "label": "Partner Name", "field_type": "text"},
    {"key": "ein", "label": "Partnership EIN", "field_type": "ein"},
    {"key": "tax_year", "label": "Tax Year", "field_type": "text"},
    {"key": "ordinary_income", "label": "Ordinary Income (Box 1)", "field_type": "money"},
    {"key": "net_rental_income", "label": "Net Rental Income (Box 2)", "field_type": "money"},
    {"key": "guaranteed_payments", "label": "Guaranteed Payments (Box 4)", "field_type": "money"},
    {"key": "capital_gains", "label": "Net Capital Gains (Box 9a)", "field_type": "money"},
]

FUND_REPORT_FIELDS: list[dict] = [
    {"key": "fund_name", "label": "Fund / Investment Name", "field_type": "text"},
    {"key": "entity_name", "label": "Company / Entity", "field_type": "text"},
    {"key": "reporting_period", "label": "Reporting Period", "field_type": "text"},
    {"key": "as_of_date", "label": "As-of Date", "field_type": "date"},
    {"key": "currency", "label": "Currency", "field_type": "text"},
    {"key": "total_revenue", "label": "Total Revenue", "field_type": "money"},
    {"key": "gross_profit", "label": "Gross Profit", "field_type": "money"},
    {"key": "gross_margin", "label": "Gross Margin %", "field_type": "percentage"},
    {"key": "ebit", "label": "EBIT / Operating Income", "field_type": "money"},
    {"key": "ebit_margin", "label": "EBIT Margin %", "field_type": "percentage"},
    {"key": "net_income", "label": "Net Income", "field_type": "money"},
    {"key": "yoy_revenue_growth", "label": "YoY Revenue Growth %", "field_type": "percentage"},
    {"key": "total_assets", "label": "Total Assets", "field_type": "money"},
    {"key": "total_liabilities", "label": "Total Liabilities", "field_type": "money"},
    {"key": "shareholders_equity", "label": "Shareholders' Equity", "field_type": "money"},
    {"key": "cash", "label": "Cash", "field_type": "money"},
    {"key": "net_debt", "label": "Net Debt", "field_type": "money"},
    {"key": "enterprise_value", "label": "Enterprise Value", "field_type": "money"},
    {"key": "equity_value", "label": "Equity Value", "field_type": "money"},
    {"key": "total_investment", "label": "Total Investment / Capital Invested", "field_type": "money"},
    {"key": "ownership_pct", "label": "Ownership %", "field_type": "percentage"},
]

FIELD_SCHEMAS: dict[str, list[dict]] = {
    "CAPITAL_CALL": CAPITAL_CALL_FIELDS,
    "DISTRIBUTION": DISTRIBUTION_FIELDS,
    "NAV_STATEMENT": NAV_STATEMENT_FIELDS,
    "K1": K1_FIELDS,
    "FUND_REPORT": FUND_REPORT_FIELDS,
}
