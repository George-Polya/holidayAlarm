// notifee 모듈 최소 목 구현
const AndroidImportance = { HIGH: 4 };
const AndroidNotificationSetting = { ENABLED: 1 };
const AuthorizationStatus = { AUTHORIZED: 1, DENIED: 2, PROVISIONAL: 3 };
const TriggerType = { TIMESTAMP: 1 };
const RepeatFrequency = { DAILY: 1 };

const notifee = {
  getNotificationSettings: jest.fn().mockResolvedValue({
    authorizationStatus: AuthorizationStatus.AUTHORIZED,
    android: { alarm: AndroidNotificationSetting.ENABLED },
  }),
  requestPermission: jest.fn().mockResolvedValue({
    authorizationStatus: AuthorizationStatus.AUTHORIZED,
  }),
  createChannel: jest.fn().mockResolvedValue('holiday-alarm-channel'),
  createTriggerNotification: jest.fn().mockResolvedValue(undefined),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  displayNotification: jest.fn().mockResolvedValue(undefined),
};

module.exports = {
  __esModule: true,
  default: notifee,
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TriggerType,
  RepeatFrequency,
};

