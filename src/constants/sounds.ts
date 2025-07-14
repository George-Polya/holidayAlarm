export interface AlarmSound {
  id: string;
  name: string;
  description?: string;
}

export const ALARM_SOUNDS: AlarmSound[] = [
  {
    id: 'default',
    name: '기본 알람',
    description: '시스템 기본 알람음',
  },
  // 시뮬레이터에서 테스트 가능한 시스템 소리들
  {
    id: 'default',
    name: '기본 알람',
    description: '시스템 기본 알람음',
  },
  // 실제 기기에서는 커스텀 소리 파일 추가 필요
  // iOS: 프로젝트에 .caf, .aiff, .wav 파일 추가
  // Android: res/raw 폴더에 .mp3, .ogg 파일 추가
];

export const DEFAULT_SOUND = 'default';

export const getSoundById = (id: string): AlarmSound | undefined => {
  return ALARM_SOUNDS.find(sound => sound.id === id);
};

export const getSoundName = (id: string): string => {
  const sound = getSoundById(id);
  return sound ? sound.name : '기본 알람';
};