import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AlarmForm from '../components/AlarmForm';
import { Weekdays } from '../types/alarm';
import { AlarmService } from '../services/AlarmService';
import { StorageService } from '../utils/storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import NotificationService from '../services/NotificationService';

type AddAlarmScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddAlarm'
>;

interface Props {
  navigation: AddAlarmScreenNavigationProp;
}

const AddAlarmScreen: React.FC<Props> = ({ navigation }) => {
  const handleSave = async (time: string, label: string, weekdays: Weekdays, sound: string) => {
    const newAlarm = AlarmService.createAlarm(time, label, weekdays, sound);
    await StorageService.addAlarm(newAlarm);
    
    // 알람 예약
    
    await NotificationService.scheduleAlarm(newAlarm);
    
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AlarmForm
        onSave={handleSave}
        onCancel={handleCancel}
        submitButtonText="추가"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default AddAlarmScreen;