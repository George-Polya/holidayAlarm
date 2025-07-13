import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Weekdays } from '../types/alarm';
import WeekdayPicker from './WeekdayPicker';

interface AlarmFormProps {
  initialTime?: string;
  initialLabel?: string;
  initialWeekdays?: Weekdays;
  onSave: (time: string, label: string, weekdays: Weekdays) => void;
  onCancel: () => void;
  submitButtonText?: string;
}

const AlarmForm: React.FC<AlarmFormProps> = ({
  initialTime = '08:00',
  initialLabel = '',
  initialWeekdays = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
    holiday: false,
  },
  onSave,
  onCancel,
  submitButtonText = '저장',
}) => {
  const [time, setTime] = useState(() => {
    const [hours, minutes] = initialTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  });
  const [label, setLabel] = useState(initialLabel);
  const [weekdays, setWeekdays] = useState(initialWeekdays);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    const hasSelectedDay = Object.values(weekdays).some(value => value);
    if (!hasSelectedDay) {
      Alert.alert('오류', '최소 하나의 요일을 선택해주세요.');
      return;
    }

    const formattedTime = moment(time).format('HH:mm');
    onSave(formattedTime, label.trim(), weekdays);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>시간</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}>
          <Text style={styles.timeText}>{moment(time).format('HH:mm')}</Text>
        </TouchableOpacity>
      </View>

      {(showTimePicker || Platform.OS === 'ios') && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>라벨</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="알람 이름을 입력하세요"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <WeekdayPicker weekdays={weekdays} onChange={setWeekdays} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>{submitButtonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AlarmForm;