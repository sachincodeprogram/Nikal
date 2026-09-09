import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Ride Search" }} />
          <Stack.Screen name="RideResults" component={RideResultsScreen} options={{ title: "Available Rides" }} />
          <Stack.Screen name="RideDetail" component={RideDetailScreen} options={{ title: "Ride Details" }} />
          <Stack.Screen name="PublishRide" component={PublishRideScreen} options={{ title: "Publish Ride" }} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "My Bookings" }} />
          <Stack.Screen name="DriverRides" component={DriverRidesScreen} options={{ title: "My Published Rides" }} />
          <Stack.Screen name="RateTrip" component={RateTripScreen} options={{ title: "Rate Trip" }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
