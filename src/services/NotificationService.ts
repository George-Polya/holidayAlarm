import notifee, { 
  AndroidImportance, 
  AndroidNotificationSetting,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { Alarm } from '../types/alarm';
import { AlarmService } from './AlarmService';
import moment from 'moment';

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
    
    // Android 알림 채널 생성
    if (Platform.OS === 'android') {
      await this.createNotificationChannel();
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

  private async createNotificationChannel() {
    await notifee.createChannel({
      id: this.channelId,
      name: '알람',
      description: '설정한 시간에 알람이 울립니다',
      sound: 'default', // 기본 알람 소리 사용
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500],
    });
  }

  async scheduleAlarm(alarm: Alarm) {
    if (!alarm.enabled) return;

    // 다음 알람 시간 계산
    const nextAlarmDate = await this.getNextAlarmDate(alarm);
    if (!nextAlarmDate) return;

    // 알림 ID는 알람 ID 사용
    const notificationId = alarm.id;

    // 알림 예약
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: alarm.label || '알람',
        body: `${alarm.time} 알람입니다`,
        android: {
          channelId: this.channelId,
          sound: alarm.sound || 'default',
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
          sound: alarm.sound || 'default',
          critical: true,
          criticalVolume: 1.0,
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
  async testNotification(sound: string = 'chime') {
    await notifee.displayNotification({
      title: '테스트 알람',
      body: '차임벨 소리가 재생됩니다',
      android: {
        channelId: this.channelId,
        sound: sound,
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: sound,
      },
    });
  }
}

export default NotificationService.getInstance();