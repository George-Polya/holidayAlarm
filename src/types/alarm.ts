export interface Weekdays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  holiday: boolean; // 공휴일
}

export interface Alarm {
  id: string;
  time: string; // HH:mm 형식
  label: string;
  enabled: boolean;
  weekdays: Weekdays;
  createdAt: string;
  updatedAt: string;
}

export const WEEKDAY_LABELS: Record<keyof Weekdays, string> = {
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  sunday: '일',
  holiday: '공',
};

export const WEEKDAY_KEYS: (keyof Weekdays)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'holiday',
];