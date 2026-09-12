import { NavigationContainer } from "@react-navigation/native";
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashOverlay from "./src/components/SplashOverlay";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // our branded overlay paints on the very first frame, so the native boot
    // splash can come down immediately instead of waiting on fonts/data
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      {fontsLoaded && (
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </AuthProvider>
      )}
      {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
    </SafeAreaProvider>
  );
}
