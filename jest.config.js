module.exports = {
  preset: 'react-native',
  // ESM 패키지들을 Babel 변환 대상으로 포함 (네비게이션, notifee 등)
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@react-native-async-storage|react-native-vector-icons|@notifee|react-native-gesture-handler|@react-native-community)/)'
  ],
  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],
  moduleNameMapper: {
    '^react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    '^@notifee/react-native$': '<rootDir>/__mocks__/@notifee/react-native.js',
    '^react-native-config$': '<rootDir>/__mocks__/react-native-config.js',
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
};
