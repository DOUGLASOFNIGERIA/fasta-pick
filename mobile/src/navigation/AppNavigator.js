import React, { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useFormFactor } from '../theme/responsive';
import { md3 } from '../theme/theme';
import {
  can,
  homeTabForRole,
  normalizeRole,
  ROLES,
} from '../constants/roles';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import AddressScreen from '../screens/AddressScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import VendorOrdersScreen from '../screens/VendorOrdersScreen';
import RiderAvailableScreen from '../screens/RiderAvailableScreen';
import RiderAssignedScreen from '../screens/RiderAssignedScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: 'home-outline',
  Explore: 'compass-outline',
  Orders: 'receipt-outline',
  Kitchen: 'restaurant-outline',
  Available: 'bicycle-outline',
  Assigned: 'checkbox-outline',
  Profile: 'person-outline',
};

const AdaptiveTabBar = ({ state, navigation, descriptors }) => {
  const { isExpanded } = useFormFactor();

  const tabItem = (route, isFocused, onPress) => {
    const label = route.name;
    const options = descriptors[route.key]?.options || {};
    const iconName = options.tabBarIconName || tabIcons[label] || 'ellipse-outline';
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        android_ripple={{ color: md3.color.primary, borderless: true }}
        onPress={onPress}
        style={[styles.tabItem, isExpanded && styles.railItem]}
      >
        <View
          style={[
            styles.indicator,
            isFocused && styles.indicatorActive,
            isExpanded && styles.railIndicator,
          ]}
        >
          <Ionicons
            name={isFocused ? iconName.replace('-outline', '') : iconName}
            size={22}
            color={isFocused ? md3.color.onSecondaryContainer : md3.color.onSurfaceVariant}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            isFocused && styles.tabLabelActive,
            isExpanded && styles.railLabel,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const tabs = state.routes.map((route, index) => {
    const isFocused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };
    return tabItem(route, isFocused, onPress);
  });

  if (isExpanded) {
    return (
      <View style={styles.rail}>
        <View style={styles.railBrand}>
          <Text style={styles.railBrandText}>F</Text>
        </View>
        {tabs}
      </View>
    );
  }

  return <View style={styles.bar}>{tabs}</View>;
};

const useTabOptions = () => {
  const { isExpanded } = useFormFactor();
  return {
    headerShown: false,
    tabBar: (props) => <AdaptiveTabBar {...props} />,
    sceneContainerStyle: isExpanded ? { paddingLeft: 80 } : undefined,
  };
};

const withRole = (Component, permission) => {
  const Guarded = (props) => {
    const { role } = useAuth();
    const navigation = useNavigation();
    const allowed = can(role, permission);

    useEffect(() => {
      if (!allowed) {
        navigation.navigate('Main', { screen: homeTabForRole(role) });
      }
    }, [allowed, role, navigation]);

    if (!allowed) return null;
    return <Component {...props} />;
  };
  return Guarded;
};

const VendorScreen = withRole(VendorOrdersScreen, 'MANAGE_ORDERS');
const RiderAvailable = withRole(RiderAvailableScreen, 'WORK_DELIVERIES');
const RiderAssigned = withRole(RiderAssignedScreen, 'WORK_DELIVERIES');

const CustomerTabs = () => {
  const options = useTabOptions();
  return (
    <Tab.Navigator screenOptions={options}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const VendorTabs = () => {
  const options = useTabOptions();
  return (
    <Tab.Navigator screenOptions={options}>
      <Tab.Screen name="Kitchen" component={VendorScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const RiderTabs = () => {
  const options = useTabOptions();
  return (
    <Tab.Navigator screenOptions={options}>
      <Tab.Screen name="Available" component={RiderAvailable} />
      <Tab.Screen name="Assigned" component={RiderAssigned} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainTabs = ({ role }) => {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.RIDER) return <RiderTabs />;
  if (normalized === ROLES.VENDOR || normalized === ROLES.ADMIN) {
    return <VendorTabs />;
  }
  return <CustomerTabs />;
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppStack = ({ role }) => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="Main">
      {() => <MainTabs role={role} />}
    </Stack.Screen>
    <Stack.Screen name="Restaurant" component={RestaurantScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    <Stack.Screen name="Address" component={AddressScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

const LoadingScreen = () => (
  <View style={styles.loading}>
    <View style={styles.logo}>
      <Text style={styles.logoText}>F</Text>
    </View>
    <Text style={styles.brand}>FastaPick</Text>
    <ActivityIndicator color={md3.color.primary} style={styles.spinner} />
    <Text style={styles.loadingText}>Warming up the kitchen...</Text>
  </View>
);

const AppNavigator = () => {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {user ? <AppStack role={role} /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'center',
    maxWidth: 720,
    backgroundColor: md3.color.surface,
    borderTopWidth: 1,
    borderTopColor: md3.color.outlineVariant,
    paddingBottom: 4,
  },
  rail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: md3.color.surface,
    borderRightWidth: 1,
    borderRightColor: md3.color.outlineVariant,
  },
  railBrand: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: md3.color.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  railBrandText: {
    fontSize: 24,
    fontWeight: '700',
    color: md3.color.onSurface,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railItem: {
    flex: 0,
    width: 80,
    marginBottom: 12,
  },
  indicator: {
    width: 64,
    height: 32,
    borderRadius: md3.shape.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorActive: {
    backgroundColor: md3.color.secondaryContainer,
  },
  railIndicator: {
    width: 56,
  },
  tabLabel: {
    fontSize: md3.type.labelMedium.fontSize,
    lineHeight: md3.type.labelMedium.lineHeight,
    fontWeight: md3.type.labelMedium.fontWeight,
    color: md3.color.onSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: md3.color.onSurface,
  },
  railLabel: {
    fontSize: md3.type.labelSmall.fontSize,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: md3.color.background,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: md3.shape.large,
    backgroundColor: md3.color.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    ...md3.elevation[3],
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: md3.color.onSurface,
  },
  brand: {
    fontSize: md3.type.titleLarge.fontSize,
    fontWeight: md3.type.titleLarge.fontWeight,
    color: md3.color.onSurface,
    marginTop: 14,
  },
  spinner: {
    marginTop: 26,
  },
  loadingText: {
    fontSize: md3.type.bodySmall.fontSize,
    color: md3.color.onSurfaceVariant,
    marginTop: 12,
  },
});

export default AppNavigator;
