import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { Alarm } from '../types/alarm';
import { AlarmService } from './AlarmService';
import moment from 'moment';
import { ALARM_SOUNDS, DEFAULT_SOUND, getSoundName } from '../constants/sounds';

class NotificationService {
  private static instance: NotificationService;
  private channelId = 'holiday-alarm-channel';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    // 알림 권한 요청
    await this.requestPermission();
    
    // Android 알림 채널 생성 (사운드별 채널 포함)
    if (Platform.OS === 'android') {
      await this.createSoundChannels();
    }
  }

  private async requestPermission(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      return true;
    }
    
    if (Platform.OS === 'ios') {
      const result = await notifee.requestPermission();
      return result.authorizationStatus === AuthorizationStatus.AUTHORIZED;
    }
    
    // Android 13+ 알림 권한
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await notifee.requestPermission();
      return result.authorizationStatus === AuthorizationStatus.AUTHORIZED;
    }
    
    return true; // Android 12 이하는 자동 승인
  }

  private getAndroidChannelIdForSound(soundId: string) {
    const safeId = soundId || DEFAULT_SOUND;
    return `holiday-alarm-${safeId}`;
  }

  private async createSoundChannels() {
    // 기본 채널(하위 호환)
    await notifee.createChannel({
      id: this.channelId,
      name: '알람',
      description: '설정한 시간에 알람이 울립니다',
      sound: 'default',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500],
    });

    // 사운드별 채널 생성
    for (const sound of ALARM_SOUNDS) {
      const id = this.getAndroidChannelIdForSound(sound.id);
      try {
        await notifee.createChannel({
          id,
          name: `알람 - ${getSoundName(sound.id)}`,
          sound: sound.id, // Android: res/raw/<sound>.mp3 필요. 없으면 기본으로 대체될 수 있음
          importance: AndroidImportance.HIGH,
          vibration: true,
          vibrationPattern: [300, 500],
        });
      } catch (e) {
        // 채널 생성 실패시 기본 채널 사용
        // 실제 디바이스에서 사운드 파일 누락 등으로 실패할 수 있음
      }
    }
  }

  private getIosSoundName(soundId: string): string {
    // iOS는 .aiff/.wav/.caf만 지원. 커스텀 파일이 없으면 기본음으로 폴백됨.
    if (!soundId || soundId === DEFAULT_SOUND) return 'default';
    // 향후 iOS 번들에 동일 이름의 .wav 등을 추가하면 바로 동작
    return `${soundId}.wav`;
  }

  async scheduleAlarm(alarm: Alarm) {
    if (!alarm.enabled) return;

    // 다음 알람 시간 계산
    const nextAlarmDate = await this.getNextAlarmDate(alarm);
    if (!nextAlarmDate) return;

    // 알림 ID는 알람 ID 사용
    const notificationId = alarm.id;

    // 알림 예약
    const soundId = alarm.sound || DEFAULT_SOUND;
    const androidChannelId = Platform.OS === 'android'
      ? (soundId === DEFAULT_SOUND ? this.channelId : this.getAndroidChannelIdForSound(soundId))
      : this.channelId;

    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: alarm.label || '알람',
        body: `${alarm.time} 알람입니다`,
        android: {
          channelId: androidChannelId,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          importance: AndroidImportance.HIGH,
          fullScreenAction: {
            id: 'default',
            launchActivity: 'default',
          },
        },
        ios: {
          sound: this.getIosSoundName(soundId),
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: nextAlarmDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      }
    );
  }

  async cancelAlarm(alarmId: string) {
    await notifee.cancelNotification(alarmId);
  }

  async cancelAllAlarms() {
    await notifee.cancelAllNotifications();
  }

  private async getNextAlarmDate(alarm: Alarm): Promise<Date | null> {
    // 오늘부터 7일간 확인
    for (let i = 0; i < 7; i++) {
      const checkDate = moment().add(i, 'days').toDate();
      const activeAlarm = await AlarmService.getActiveAlarmForDate(checkDate);
      
      if (activeAlarm && activeAlarm.id === alarm.id) {
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const alarmDate = moment(checkDate)
          .hours(hours)
          .minutes(minutes)
          .seconds(0);
        
        // 오늘이고 이미 지난 시간이면 다음 날로
        if (i === 0 && alarmDate.isBefore(moment())) {
          continue;
        }
        
        return alarmDate.toDate();
      }
    }
    
    return null;
  }

  async updateAlarm(alarm: Alarm) {
    // 기존 알람 취소
    await this.cancelAlarm(alarm.id);
    
    // 새로 예약
    if (alarm.enabled) {
      await this.scheduleAlarm(alarm);
    }
  }

  async rescheduleAllAlarms(alarms: Alarm[]) {
    // 모든 알림 취소
    await this.cancelAllAlarms();
    
    // 활성화된 알람만 다시 예약
    for (const alarm of alarms) {
      if (alarm.enabled) {
        await this.scheduleAlarm(alarm);
      }
    }
  }

  // 테스트용 즉시 알림
  async testNotification(sound: string = DEFAULT_SOUND) {
    const soundId = sound || DEFAULT_SOUND;
    const androidChannelId = Platform.OS === 'android'
      ? (soundId === DEFAULT_SOUND ? this.channelId : this.getAndroidChannelIdForSound(soundId))
      : this.channelId;
    await notifee.displayNotification({
      title: '테스트 알람',
      body: '선택한 알람음이 재생됩니다',
      android: {
        channelId: androidChannelId,
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: this.getIosSoundName(soundId),
      },
    });
  }
}

export default NotificationService.getInstance();
