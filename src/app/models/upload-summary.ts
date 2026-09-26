export interface RowError {
    lineNumber: number;
    message: string;
    errorType?: 'VALIDATION' | 'DUPLICATR' | 'OTHER' | string;
}

export interface UploadSummary {
    total: number;
    inserted: number;
    validationErrors: number;
    duplicateErrors: number;
    otherErrors: number;
    errors: RowError[];
}