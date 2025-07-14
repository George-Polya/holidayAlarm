import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AlarmForm from '../components/AlarmForm';
import { Weekdays } from '../types/alarm';
import { StorageService } from '../utils/storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import NotificationService from '../services/NotificationService';

type EditAlarmScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EditAlarm'
>;

type EditAlarmScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditAlarm'
>;

interface Props {
  navigation: EditAlarmScreenNavigationProp;
  route: EditAlarmScreenRouteProp;
}

const EditAlarmScreen: React.FC<Props> = ({ navigation, route }) => {
  const { alarm } = route.params;

  const handleSave = async (time: string, label: string, weekdays: Weekdays, sound: string) => {
    await StorageService.updateAlarm(alarm.id, {
      time,
      label,
      weekdays,
      sound,
    });
    
    // 알람 업데이트
    const updatedAlarm = { ...alarm, time, label, weekdays, sound };
    await NotificationService.updateAlarm(updatedAlarm);
    
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AlarmForm
        initialTime={alarm.time}
        initialLabel={alarm.label}
        initialWeekdays={alarm.weekdays}
        initialSound={alarm.sound}
        onSave={handleSave}
        onCancel={handleCancel}
        submitButtonText="수정"
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

export default EditAlarmScreen;