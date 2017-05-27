export interface ValidationRule {
    id?: string;
    name?: string;
    selector?: string;
    rule: string;
    parameters?: any;
    message: string;
}