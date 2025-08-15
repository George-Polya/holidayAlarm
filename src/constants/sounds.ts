export interface AlarmSound {
  id: string;
  name: string;
  description?: string;
}

export const ALARM_SOUNDS: AlarmSound[] = [
  // 커스텀 사운드 (Android: res/raw에 파일 필요)
  { id: 'analog_alarm', name: '아날로그 알람', description: '아날로그 시계 알람음' },
  { id: 'digital_alarm', name: '디지털 알람', description: '디지털 알람음' },
  // 참고: iOS는 .aiff/.wav/.caf 형식만 지원
  // 커스텀 iOS 사운드를 쓰려면 동일 이름의 파일을 iOS 번들에 추가하세요.
];

export const DEFAULT_SOUND = 'default';
export const isValidSoundId = (id?: string | null): boolean => {
  if (!id) return false;
  return ALARM_SOUNDS.some(s => s.id === id);
};
// 앱에서 새 알람 생성 시 기본 선택값(리스트의 첫 항목)
export const PREFERRED_DEFAULT_SOUND = 'analog_alarm';

export const getSoundById = (id: string): AlarmSound | undefined => {
  return ALARM_SOUNDS.find(sound => sound.id === id);
};

export const getSoundName = (id: string): string => {
  const sound = getSoundById(id);
  return sound ? sound.name : '아날로그 알람';
};
