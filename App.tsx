import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { HolidayManager } from './src/services/HolidayManager';
import NotificationService from './src/services/NotificationService';
import { StorageService } from './src/utils/storage';
import { ALARM_SOUNDS, DEFAULT_SOUND, PREFERRED_DEFAULT_SOUND } from './src/constants/sounds';

function App() {
  useEffect(() => {
    // 앱 시작 시 초기화
    const initializeApp = async () => {
      try {
        // HolidayManager 초기화
        const manager = HolidayManager.getInstance();
        await manager.initialize();
        console.log('HolidayManager 초기화 성공');

        // NotificationService 초기화
        await NotificationService.initialize();
        console.log('NotificationService 초기화 성공');

        // 사운드 마이그레이션: default/비유효 값을 아날로그로 보정
        try {
          const alarms = await StorageService.getAlarms();
          let changed = false;
          const validIds = new Set(ALARM_SOUNDS.map(s => s.id));
          const migrated = alarms.map(a => {
            const invalid = !a.sound || a.sound === DEFAULT_SOUND || !validIds.has(a.sound);
            if (invalid) {
              changed = true;
              return { ...a, sound: PREFERRED_DEFAULT_SOUND, updatedAt: new Date().toISOString() };
            }
            return a;
          });
          if (changed) {
            await StorageService.saveAlarms(migrated);
            await NotificationService.rescheduleAllAlarms(migrated);
            console.log('사운드 마이그레이션 완료: default -> analog');
          }
        } catch (e) {
          console.warn('사운드 마이그레이션 실패:', e);
        }
      } catch (error) {
        console.error('앱 초기화 실패:', error);
      }
    };

    initializeApp();
  }, []);

  return <AppNavigator />;
}

export default App;
