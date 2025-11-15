import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { JobListScreen } from '../screens/JobListScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { MyJobsScreen } from '../screens/MyJobsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateJobScreen } from '../screens/CreateJobScreen';
import { EditJobScreen } from '../screens/EditJobScreen';
import { LocationPickerScreen } from '../screens/LocationPickerScreen';
import { ApplicationsListScreen } from '../screens/ApplicationsListScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { colors } from '../theme/colors';
import { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
};

const MainTabs = () => {
  const { user } = useAuth();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          paddingVertical: 8,
          height: 70,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list';
          if (route.name === 'Explore') iconName = 'map';
          if (route.name === 'MyJobs') iconName = user?.role === 'volunteer' ? 'briefcase' : 'create';
          if (route.name === 'Profile') iconName = 'person-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="Explore"
        component={JobListScreen}
        options={{ title: user?.role === 'requester' ? 'งานของฉัน' : 'สำรวจ' }}
      />
      <Tabs.Screen
        name="MyJobs"
        component={MyJobsScreen}
        options={{ title: user?.role === 'volunteer' ? 'ใบสมัครของฉัน' : 'ประวัติงาน' }}
      />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: 'โปรไฟล์' }} />
    </Tabs.Navigator>
  );
};

export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{ title: 'รายละเอียดงาน' }}
            />
            <Stack.Screen
              name="CreateJob"
              component={CreateJobScreen}
              options={{ title: 'สร้างงานใหม่' }}
            />
            <Stack.Screen
              name="EditJob"
              component={EditJobScreen}
              options={{ title: 'แก้ไขรายละเอียดงาน' }}
            />
            <Stack.Screen
              name="LocationPicker"
              component={LocationPickerScreen}
              options={{ title: 'เลือกตำแหน่ง' }}
            />
            <Stack.Screen
              name="ApplicationsList"
              component={ApplicationsListScreen}
              options={{ title: 'ผู้สมัครงาน' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'โปรไฟล์' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: 'แก้ไขโปรไฟล์' }}
            />
            <Stack.Screen
              name="Reviews"
              component={ReviewsScreen}
              options={{ title: 'ความคิดเห็นทั้งหมด' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
