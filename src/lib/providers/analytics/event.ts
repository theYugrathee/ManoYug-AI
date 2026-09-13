export type AnalyticsEvent = {
  name: string;
  userId?: string;
  institutionId?: string;
  /** Never include raw chat content or health diagnoses */
  properties?: Record<string, string | number | boolean | null>;
};
