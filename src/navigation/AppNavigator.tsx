import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import * as Linking from 'expo-linking';

import {Colors} from '../theme';
import {RootStackParamList} from './types';

import HomeScreen from '../screens/HomeScreen';
import MedicineScreen from '../screens/MedicineScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import NutritionScreen from '../screens/NutritionScreen';
import BagChecklistScreen from '../screens/BagChecklistScreen';
import ObjectScanScreen from '../screens/ObjectScanScreen';
import PatientProfileScreen from '../screens/PatientProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
  prefixes: [Linking.createURL('/'), 'ameliyatar://'],
  config: {
    screens: {
      Home: '',
      Medicine: 'medicine',
      WaterTracker: 'water',
      Nutrition: 'nutrition',
      BagChecklist: 'bag',
      ObjectScan: 'scan',
      PatientProfile: 'profile',
    },
  },
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer linking={linking}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.bgPrimary}
        translucent={false}
      />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: {backgroundColor: Colors.bgPrimary},
          gestureEnabled: true,
          animationEnabled: true,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Medicine"
          component={MedicineScreen}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen
          name="WaterTracker"
          component={WaterTrackerScreen}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen
          name="Nutrition"
          component={NutritionScreen}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen
          name="BagChecklist"
          component={BagChecklistScreen}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen
          name="ObjectScan"
          component={ObjectScanScreen}
          options={{gestureEnabled: false}}
        />
        <Stack.Screen name="PatientProfile" component={PatientProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
