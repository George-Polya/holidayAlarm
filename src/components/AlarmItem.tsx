import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alarm, WEEKDAY_LABELS, WEEKDAY_KEYS } from '../types/alarm';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onToggleHolidayOff?: (id: string) => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({
  alarm,
  onToggle,
  onPress,
  onDelete,
  onToggleHolidayOff,
}) => {
  const getWeekdaysText = () => {
    const activeWeekdays = WEEKDAY_KEYS.filter(key => alarm.weekdays[key]);
    
    if (activeWeekdays.length === 0) return '반복 없음';
    if (activeWeekdays.length === 8) return '매일';
    
    return activeWeekdays.map(key => WEEKDAY_LABELS[key]).join(' ');
  };

  const handleDelete = () => {
    Alert.alert(
      '알람 삭제',
      '이 알람을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => onDelete(alarm.id) },
      ],
    );
  };

  const handleHolidayOffToggle = () => {
    if (onToggleHolidayOff) {
      onToggleHolidayOff(alarm.id);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !alarm.enabled && styles.disabled]}
      onPress={() => onPress(alarm)}
      activeOpacity={0.7}>
      <View style={styles.timeContainer}>
        <Text style={[styles.time, !alarm.enabled && styles.disabledText]}>
          {alarm.time}
        </Text>
        <Text style={[styles.label, !alarm.enabled && styles.disabledText]}>
          {alarm.label || '알람'}
        </Text>
        <Text style={[styles.weekdays, !alarm.enabled && styles.disabledText]}>
          {getWeekdaysText()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <Switch
          value={alarm.enabled}
          onValueChange={() => onToggle(alarm.id)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={alarm.enabled ? '#2196F3' : '#f4f3f4'}
        />
        {onToggleHolidayOff && (
          <TouchableOpacity 
            onPress={handleHolidayOffToggle} 
            style={[styles.holidayOffButton, !alarm.enabled && styles.disabledButton]}
          >
            <Icon 
              name="beach-access" 
              size={24} 
              color={!alarm.enabled ? '#e0e0e0' : (alarm.disableOnHoliday ? '#ff6666' : '#cccccc')} 
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  timeContainer: {
    flex: 1,
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  weekdays: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  disabledText: {
    color: '#ccc',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holidayOffButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  deleteButton: {
    padding: 8,
  },
});

export default AlarmItem;