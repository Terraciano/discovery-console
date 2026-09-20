export type EvidenceStatus = "confirmed" | "inferred" | "unknown";

export type AnswerValue = string | boolean | string[];

export type Answer = {
  value: AnswerValue;
  status: EvidenceStatus;
};

export type DiscoveryState = {
  answers: Record<string, Answer>;
};

export type FieldType = "text" | "textarea" | "checkbox" | "select" | "multiselect";

export type Option = {
  label: string;
  value: string;
};

export type Question = {
  id: string;
  label: string;
  help?: string;
  type: FieldType;
  options?: Option[];
  placeholder?: string;
};

export type Section = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
};
