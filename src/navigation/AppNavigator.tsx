import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AlarmListScreen from '../screens/AlarmListScreen';
import AddAlarmScreen from '../screens/AddAlarmScreen';
import EditAlarmScreen from '../screens/EditAlarmScreen';
import { Alarm } from '../types/alarm';

export type RootStackParamList = {
  AlarmList: undefined;
  AddAlarm: undefined;
  EditAlarm: { alarm: Alarm };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AlarmList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="AlarmList"
          component={AlarmListScreen}
          options={{ title: '알람 목록' }}
        />
        <Stack.Screen
          name="AddAlarm"
          component={AddAlarmScreen}
          options={{ title: '알람 추가' }}
        />
        <Stack.Screen
          name="EditAlarm"
          component={EditAlarmScreen}
          options={{ title: '알람 편집' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;