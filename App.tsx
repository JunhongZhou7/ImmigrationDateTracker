import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {loadProfile} from './src/storage/store';
import SetupScreen from './src/screens/SetupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RecordsScreen from './src/screens/RecordsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, string> = {
  Dashboard: '🏠',
  Records: '📋',
  Settings: '⚙️',
};

export default function App() {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    loadProfile().then(profile => {
      setIsSetup(profile !== null);
    });
  }, []);

  if (isSetup === null) {
    return null; // loading
  }

  if (!isSetup) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <SetupScreen onComplete={() => setIsSetup(true)} />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({route}) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#1e293b',
              borderTopColor: '#334155',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: '#60a5fa',
            tabBarInactiveTintColor: '#64748b',
            tabBarIcon: () => null,
            tabBarLabel: ({focused}) => {
              const icon = tabIcons[route.name] || '';
              const labels: Record<string, string> = {
                Dashboard: '首页',
                Records: '日志',
                Settings: '设置',
              };
              return (
                <React.Fragment>
                  {/* Using emoji as tab icon */}
                </React.Fragment>
              );
            },
            tabBarLabelStyle: {fontSize: 12},
          })}>
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarLabel: '🏠 首页',
            }}
          />
          <Tab.Screen
            name="Records"
            component={RecordsScreen}
            options={{
              tabBarLabel: '📋 日志',
            }}
          />
          <Tab.Screen
            name="Settings"
            options={{
              tabBarLabel: '⚙️ 设置',
            }}>
            {() => <SettingsScreen onReset={() => setIsSetup(false)} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
