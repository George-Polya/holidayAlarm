import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { HolidayManager } from './src/services/HolidayManager';
import NotificationService from './src/services/NotificationService';

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
      } catch (error) {
        console.error('앱 초기화 실패:', error);
      }
    };

    initializeApp();
  }, []);

  return <AppNavigator />;
}

export default App;
