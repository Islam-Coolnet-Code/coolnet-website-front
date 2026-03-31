export interface FieldValidationError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}
