export interface ReportCompany {
    name: string;
    report_type: string;
    basis: string;
    period: string;
    actuals_to: string;
}

export interface ReportColumn {
    month: string;
    type: 'Actual' | 'Forecast' | 'Total';
}

export interface ReportLineItem {
    name: string;
    account_id: string;
    values: number[];
}

export interface ReportSubsection {
    id: string;
    name: string;
    level: number;
    collapsible: boolean;
    expanded: boolean;
    subsections?: ReportSubsection[];
    line_items?: ReportLineItem[];
    gross_profit?: ReportTotal;
}

export interface ReportSection {
    id: string;
    name: string;
    level: number;
    collapsible: boolean;
    expanded: boolean;
    subsections: ReportSubsection[];
    total: ReportTotal;
}

export interface ReportTotal {
    name: string;
    values: number[];
}

export interface ReportSummary {
    name: string;
    values: number[];
}

export interface Report {
    company: ReportCompany;
    columns: ReportColumn[];
    sections: ReportSection[];
    summary: ReportSummary[];
}
