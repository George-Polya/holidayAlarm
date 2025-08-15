import moment from 'moment';
import { Alarm, Weekdays } from '../types/alarm';
import { HolidayManager } from './HolidayManager';
import { StorageService } from '../utils/storage';

export class AlarmService {
  private static getWeekdayKey(date: Date): keyof Weekdays {
    const dayOfWeek = date.getDay();
    const weekdayMap: Record<number, keyof Weekdays> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    return weekdayMap[dayOfWeek];
  }

  static async getActiveAlarmForDate(date: Date): Promise<Alarm | null> {
    const alarms = await StorageService.getAlarms();
    const enabledAlarms = alarms.filter(a => a.enabled);
    
    if (enabledAlarms.length === 0) return null;

    const weekdayKey = this.getWeekdayKey(date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 일요일(0) 또는 토요일(6)
    
    // 1. 주말인 경우 - 최우선 순위
    if (isWeekend) {
      const weekendAlarms = enabledAlarms.filter(a => a.weekdays[weekdayKey]);
      if (weekendAlarms.length > 0) {
        return this.getEarliestAlarm(weekendAlarms, date);
      }
    }
    
    // 2. 공휴일인지 확인
    const holidayManager = HolidayManager.getInstance();
    const isHoliday = await holidayManager.isHoliday(date);
    if (isHoliday) {
      // 공휴일 OFF 기능이 활성화되지 않은 알람들만 필터링
      const activeAlarms = enabledAlarms.filter(a => !a.disableOnHoliday);
      
      // 공휴일에는 공휴일 선택된 알람만 울려야 함
      const holidayAlarms = activeAlarms.filter(a => a.weekdays.holiday);
      
      if (holidayAlarms.length > 0) {
        return this.getEarliestAlarm(holidayAlarms, date);
      }
      
      return null;
    }
    
    // 3. 평일인 경우
    const weekdayAlarms = enabledAlarms.filter(a => a.weekdays[weekdayKey]);
    return this.getEarliestAlarm(weekdayAlarms, date);
  }

  private static getEarliestAlarm(alarms: Alarm[], date: Date): Alarm | null {
    if (alarms.length === 0) return null;
    
    const now = moment();
    const todayAlarms = alarms
      .map(alarm => {
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const alarmTime = moment(date)
          .hours(hours)
          .minutes(minutes)
          .seconds(0);
        
        return { alarm, alarmTime };
      })
      .filter(({ alarmTime }) => alarmTime.isAfter(now))
      .sort((a, b) => a.alarmTime.valueOf() - b.alarmTime.valueOf());
    
    return todayAlarms.length > 0 ? todayAlarms[0].alarm : null;
  }

  static async getNextAlarm(): Promise<{ alarm: Alarm; date: Date } | null> {
    const alarms = await StorageService.getAlarms();
    const enabledAlarms = alarms.filter(a => a.enabled);
    
    if (enabledAlarms.length === 0) return null;

    // 오늘부터 7일간 확인
    for (let i = 0; i < 7; i++) {
      const checkDate = moment().add(i, 'days').toDate();
      const alarm = await this.getActiveAlarmForDate(checkDate);
      
      if (alarm) {
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const alarmDate = moment(checkDate)
          .hours(hours)
          .minutes(minutes)
          .seconds(0);
        
        // 오늘이고 이미 지난 시간이면 스킵
        if (i === 0 && alarmDate.isBefore(moment())) {
          continue;
        }
        
        return { alarm, date: alarmDate.toDate() };
      }
    }
    
    return null;
  }

  static generateAlarmId(): string {
    return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createAlarm(time: string, label: string, weekdays: Weekdays, sound?: string): Alarm {
    const now = new Date().toISOString();
    return {
      id: this.generateAlarmId(),
      time,
      label,
      enabled: true,
      weekdays,
      // 새 알람 기본값은 아날로그 알람으로 설정
      sound: sound || 'analog_alarm',
      createdAt: now,
      updatedAt: now,
    };
  }
}
