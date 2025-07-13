import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import 'moment/locale/ko';

import AlarmItem from '../components/AlarmItem';
import { Alarm } from '../types/alarm';
import { StorageService } from '../utils/storage';
import { AlarmService } from '../services/AlarmService';
import { RootStackParamList } from '../navigation/AppNavigator';

moment.locale('ko');

type AlarmListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AlarmList'
>;

interface Props {
  navigation: AlarmListScreenNavigationProp;
}

const AlarmListScreen: React.FC<Props> = ({ navigation }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [nextAlarm, setNextAlarm] = useState<{ alarm: Alarm; date: Date } | null>(null);

  const loadAlarms = async () => {
    const loadedAlarms = await StorageService.getAlarms();
    setAlarms(loadedAlarms);
    
    const next = await AlarmService.getNextAlarm();
    setNextAlarm(next);
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  useEffect(() => {
    // 1분마다 다음 알람 시간 업데이트
    const interval = setInterval(async () => {
      const next = await AlarmService.getNextAlarm();
      setNextAlarm(next);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAlarm = async (id: string) => {
    await StorageService.toggleAlarm(id);
    await loadAlarms();
  };

  const handleDeleteAlarm = async (id: string) => {
    await StorageService.deleteAlarm(id);
    await loadAlarms();
  };

  const handleEditAlarm = (alarm: Alarm) => {
    navigation.navigate('EditAlarm', { alarm });
  };

  const handleAddAlarm = () => {
    navigation.navigate('AddAlarm');
  };

  const renderNextAlarmInfo = () => {
    if (!nextAlarm) {
      return (
        <View style={styles.nextAlarmContainer}>
          <Text style={styles.nextAlarmText}>설정된 알람이 없습니다</Text>
        </View>
      );
    }

    const { alarm, date } = nextAlarm;
    const formattedDate = moment(date).format('M월 D일 (ddd) a h:mm');

    return (
      <View style={styles.nextAlarmContainer}>
        <Text style={styles.nextAlarmLabel}>다음 알람</Text>
        <Text style={styles.nextAlarmTime}>{formattedDate}</Text>
        <Text style={styles.nextAlarmDescription}>{alarm.label || '알람'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>알람</Text>
      </View>
      {renderNextAlarmInfo()}
      
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlarmItem
            alarm={item}
            onToggle={handleToggleAlarm}
            onPress={handleEditAlarm}
            onDelete={handleDeleteAlarm}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="alarm-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>알람이 없습니다</Text>
            <Text style={styles.emptySubText}>+ 버튼을 눌러 알람을 추가하세요</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddAlarm}
        activeOpacity={0.8}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  nextAlarmContainer: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  nextAlarmLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  nextAlarmTime: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  nextAlarmText: {
    color: '#fff',
    fontSize: 18,
  },
  nextAlarmDescription: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default AlarmListScreen;