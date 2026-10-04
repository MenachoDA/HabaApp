import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemeProvider } from './src/context/ThemeContext';
import { FinanceProvider } from './src/context/FinanceContext';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BearButton } from './src/components/BearButton';

const MainApp = () => {
  const [currentView, setCurrentView] = useState<'register' | 'dashboard'>('register');

  const toggleView = () => {
    setCurrentView(prev => prev === 'register' ? 'dashboard' : 'register');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {currentView === 'register' ? (
        <Animated.View style={styles.fullScreen} entering={FadeIn} exiting={FadeOut}>
          <RegisterScreen />
        </Animated.View>
      ) : (
        <Animated.View style={styles.fullScreen} entering={FadeIn} exiting={FadeOut}>
          <DashboardScreen />
        </Animated.View>
      )}

      <BearButton onPress={toggleView} isActive={currentView === 'dashboard'} />
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    ...StyleSheet.absoluteFill,
  }
});