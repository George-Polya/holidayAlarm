import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { HolidayManager } from './src/services/HolidayManager';

function App() {
  useEffect(() => {
    // 앱 시작 시 HolidayManager 초기화
    const initializeHolidayManager = async () => {
      try {
        const manager = HolidayManager.getInstance();
        await manager.initialize();
        console.log('HolidayManager 초기화 성공');
      } catch (error) {
        console.error('HolidayManager 초기화 실패:', error);
      }
    };

    initializeHolidayManager();
  }, []);

  return <AppNavigator />;
}

export default App;
