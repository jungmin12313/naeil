export type Grade = 'RED' | 'YELLOW' | 'GREEN';

export interface GradingResult {
  grade: Grade;
  comment: string;
}

export interface PlaceInput {
  ramp: string;
  door: string;
  space: string;
  threshold: number; // cm
  door_width: number; // cm
}

export function gradePlace(input: PlaceInput): GradingResult {
  const { ramp, door, threshold, door_width } = input;

  // Rule 1: RED (Impossible)
  // Stairs only OR Door too narrow (<90cm) OR Threshold too high (>5cm)
  if (ramp === '계단만' || door_width < 90 || threshold > 5) {
    return {
      grade: 'RED',
      comment: '⛔ 휠체어 진입 불가 (문폭 90cm 미만 또는 턱 높음)',
    };
  }

  // Rule 2: YELLOW (Need Help)
  // Ramp OR Swing door OR Threshold > 2cm
  if (ramp === '경사로' || door === '여닫이' || threshold > 2) {
    return {
      grade: 'YELLOW',
      comment: '⚠️ 턱이나 문 때문에 도움이 필요할 수 있어요',
    };
  }

  // Rule 3: GREEN (Free)
  return {
    grade: 'GREEN',
    comment: '✅ 턱 2cm 이하, 문폭 90cm 이상! 혼자서도 가능해요',
  };
}
