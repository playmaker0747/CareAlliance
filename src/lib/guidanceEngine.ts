export interface IntakeData {
  ageGroup: string | null;
  primarySymptom: string | null;
  duration: string | null;
  severity: string | null;
  redFlags: string[];
}

export type Recommendation = 
  | 'seek urgent care now'
  | 'visit a clinic today'
  | 'monitor and arrange medical review if symptoms continue';

export function determineGuidance(data: IntakeData): Recommendation {
  // 1. Red Flags always trigger urgent care
  if (data.redFlags && data.redFlags.length > 0) {
    return 'seek urgent care now';
  }

  // 2. Severe symptoms are a safety fallback to urgent
  if (data.severity === 'severe') {
    return 'seek urgent care now';
  }

  // 3. High risk demographics or longer duration bounds
  if (
    data.duration === '3+ days' || 
    data.severity === 'moderate' || 
    data.ageGroup === 'infant' || 
    data.ageGroup === 'older adult' ||
    (data.primarySymptom === 'breathing problem' || data.primarySymptom === 'chest pain')
  ) {
    return 'visit a clinic today';
  }

  // 4. Mild cases
  if (data.severity === 'mild' && (data.duration === 'today' || data.duration === '1-2 days')) {
    return 'monitor and arrange medical review if symptoms continue';
  }

  // Fallback for incomplete or ambiguous input
  return 'visit a clinic today';
}
