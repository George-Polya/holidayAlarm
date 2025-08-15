import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Weekdays, WEEKDAY_LABELS, WEEKDAY_KEYS } from '../types/alarm';

interface WeekdayPickerProps {
  weekdays: Weekdays;
  onChange: (weekdays: Weekdays) => void;
}

const WeekdayPicker: React.FC<WeekdayPickerProps> = ({ weekdays, onChange }) => {
  const handleToggle = (key: keyof Weekdays) => {
    onChange({
      ...weekdays,
      [key]: !weekdays[key],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>반복 요일</Text>
      <View style={styles.weekdaysContainer}>
        {WEEKDAY_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.weekdayButton,
              weekdays[key] && styles.weekdayButtonActive,
              key === 'holiday' && styles.holidayButton,
              key === 'holiday' && weekdays[key] && styles.holidayButtonActive,
            ]}
            onPress={() => handleToggle(key)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.weekdayText,
                weekdays[key] && styles.weekdayTextActive,
                key === 'holiday' && styles.holidayText,
                key === 'holiday' && weekdays[key] && styles.holidayTextActive,
              ]}>
              {WEEKDAY_LABELS[key]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {weekdays.holiday && (
        <Text style={styles.holidayInfo}>
          공휴일 알람은 평일 알람보다 우선됩니다
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  weekdayButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  holidayButton: {
    borderColor: '#ffcccc',
  },
  holidayButtonActive: {
    borderColor: '#ff4444',
    backgroundColor: '#ff4444',
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  weekdayTextActive: {
    color: '#fff',
  },
  holidayText: {
    color: '#ff4444',
  },
  holidayTextActive: {
    color: '#fff',
  },
  holidayInfo: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WeekdayPicker;
