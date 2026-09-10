import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { ChevronLeftIcon } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import AdminBookingsScreen from "../screens/AdminBookingsScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminPayoutsScreen from "../screens/AdminPayoutsScreen";
import AdminReportsScreen from "../screens/AdminReportsScreen";
import AdminRidesScreen from "../screens/AdminRidesScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";
import ChatScreen from "../screens/ChatScreen";
import DriverRidesScreen from "../screens/DriverRidesScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PublishRideScreen from "../screens/PublishRideScreen";
import RateTripScreen from "../screens/RateTripScreen";
import RideDetailScreen from "../screens/RideDetailScreen";
import RideResultsScreen from "../screens/RideResultsScreen";
import SearchScreen from "../screens/SearchScreen";
import { colors, fonts } from "../theme";
import { Ride } from "../types";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Search: undefined;
  RideResults: { rides: Ride[] };
  RideDetail: { rideId: string };
  PublishRide: undefined;
  MyBookings: undefined;
  DriverRides: undefined;
  RateTrip: { bookingId: string; rateeName?: string };
  Profile: undefined;
  Chat: { bookingId: string; otherUserName?: string };
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminRides: undefined;
  AdminBookings: undefined;
  AdminReports: undefined;
  AdminPayouts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ChevronLeftIcon size={19} color={colors.ink900} />
    </TouchableOpacity>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontFamily: fonts.extrabold, fontSize: 19, color: colors.ink900 },
        headerTitleAlign: "left",
        headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Find a Ride" }} />
          <Stack.Screen name="RideResults" component={RideResultsScreen} options={{ title: "Available Rides" }} />
          <Stack.Screen name="RideDetail" component={RideDetailScreen} options={{ title: "Ride Details" }} />
          <Stack.Screen name="PublishRide" component={PublishRideScreen} options={{ title: "Publish a Ride" }} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "My Bookings" }} />
          <Stack.Screen name="DriverRides" component={DriverRidesScreen} options={{ title: "My Published Rides" }} />
          <Stack.Screen name="RateTrip" component={RateTripScreen} options={{ title: "Rate Trip" }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({ title: route.params.otherUserName ?? "Chat" })}
          />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Admin" }} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: "Users" }} />
          <Stack.Screen name="AdminRides" component={AdminRidesScreen} options={{ title: "Rides" }} />
          <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} options={{ title: "Bookings" }} />
          <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: "Reports" }} />
          <Stack.Screen name="AdminPayouts" component={AdminPayoutsScreen} options={{ title: "Payouts" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
