import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '../navigation/RootNavigator';
import '../shared/i18n';
import { requestUserPermission, setupForegroundHandler } from '../shared/utils/fcm';

export default function App() {
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = setupForegroundHandler();
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
