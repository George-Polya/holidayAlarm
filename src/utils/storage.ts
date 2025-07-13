import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types/alarm';

const ALARMS_KEY = 'ALARMS_DATA';

export class StorageService {
  static async getAlarms(): Promise<Alarm[]> {
    try {
      const data = await AsyncStorage.getItem(ALARMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('알람 데이터 읽기 오류:', error);
      return [];
    }
  }

  static async saveAlarms(alarms: Alarm[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
    } catch (error) {
      console.error('알람 데이터 저장 오류:', error);
      throw error;
    }
  }

  static async addAlarm(alarm: Alarm): Promise<void> {
    const alarms = await this.getAlarms();
    alarms.push(alarm);
    await this.saveAlarms(alarms);
  }

  static async updateAlarm(id: string, updatedAlarm: Partial<Alarm>): Promise<void> {
    const alarms = await this.getAlarms();
    const index = alarms.findIndex(a => a.id === id);
    
    if (index !== -1) {
      alarms[index] = {
        ...alarms[index],
        ...updatedAlarm,
        updatedAt: new Date().toISOString(),
      };
      await this.saveAlarms(alarms);
    }
  }

  static async deleteAlarm(id: string): Promise<void> {
    const alarms = await this.getAlarms();
    const filtered = alarms.filter(a => a.id !== id);
    await this.saveAlarms(filtered);
  }

  static async toggleAlarm(id: string): Promise<void> {
    const alarms = await this.getAlarms();
    const alarm = alarms.find(a => a.id === id);
    
    if (alarm) {
      await this.updateAlarm(id, { enabled: !alarm.enabled });
    }
  }
}