import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { Weekdays } from '../types/alarm';
import WeekdayPicker from './WeekdayPicker';
import { ALARM_SOUNDS, getSoundName, PREFERRED_DEFAULT_SOUND, isValidSoundId } from '../constants/sounds';
import SoundPreview from '../services/SoundPreview';

interface AlarmFormProps {
  initialTime?: string;
  initialLabel?: string;
  initialWeekdays?: Weekdays;
  initialSound?: string;
  onSave: (time: string, label: string, weekdays: Weekdays, sound: string) => void;
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
  initialSound = PREFERRED_DEFAULT_SOUND,
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
  const [selectedSound, setSelectedSound] = useState(initialSound);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const handleSave = () => {
    const hasSelectedDay = Object.values(weekdays).some(value => value);
    if (!hasSelectedDay) {
      Alert.alert('오류', '최소 하나의 요일을 선택해주세요.');
      return;
    }

    const formattedTime = moment(time).format('HH:mm');
    onSave(formattedTime, label.trim(), weekdays, selectedSound);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  // 언마운트 시 미리듣기 정지
  useEffect(() => {
    // 불완전/이전 데이터(default 등) 보정
    if (!isValidSoundId(selectedSound)) {
      setSelectedSound(PREFERRED_DEFAULT_SOUND);
    }

    SoundPreview.setListener((id) => {
      setPreviewingId(id);
    });
    return () => {
      SoundPreview.setListener(undefined);
      SoundPreview.stop();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.sectionTitle}>알람음</Text>
        <TouchableOpacity
          style={styles.soundButton}
          onPress={() => setShowSoundPicker(!showSoundPicker)}>
          <View style={styles.soundButtonContent}>
            <Icon name="music-note" size={24} color="#666" />
            <Text style={styles.soundText}>{getSoundName(selectedSound)}</Text>
            <Icon 
              name={showSoundPicker ? "expand-less" : "expand-more"} 
              size={24} 
              color="#666" 
            />
          </View>
        </TouchableOpacity>
        
        {showSoundPicker && (
          <View style={styles.soundPickerContainer}>
            {ALARM_SOUNDS.map((sound) => (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundItem,
                  selectedSound === sound.id && styles.selectedSoundItem
                ]}
                onPress={() => {
                  setSelectedSound(sound.id);
                  setShowSoundPicker(false);
                  // 선택 시 미리듣기 중이면 정지
                  if (previewingId) {
                    SoundPreview.stop();
                    setPreviewingId(null);
                  }
                }}>
                <View style={styles.soundItemContent}>
                  <Text style={[
                    styles.soundItemText,
                    selectedSound === sound.id && styles.selectedSoundItemText
                  ]}>
                    {sound.name}
                  </Text>
                  {sound.description && (
                    <Text style={styles.soundItemDescription}>
                      {sound.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    if (previewingId === sound.id) {
                      SoundPreview.stop();
                      setPreviewingId(null);
                    } else {
                      SoundPreview.play(sound.id);
                      setPreviewingId(sound.id);
                    }
                  }}
                  style={styles.previewButton}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={previewingId === sound.id ? 'stop' : 'play-arrow'} 
                    size={24} 
                    color={previewingId === sound.id ? '#d32f2f' : '#2196F3'}
                  />
                </TouchableOpacity>
                {selectedSound === sound.id && (
                  <Icon name="check" size={24} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    </ScrollView>
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
  soundButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
  },
  soundButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soundText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  soundPickerContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  previewButton: {
    padding: 8,
    marginRight: 8,
  },
  selectedSoundItem: {
    backgroundColor: '#e3f2fd',
  },
  soundItemContent: {
    flex: 1,
  },
  soundItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedSoundItemText: {
    color: '#2196F3',
  },
  soundItemDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});

export default AlarmForm;
