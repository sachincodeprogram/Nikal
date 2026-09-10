import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Testing on a physical phone over USB: `adb reverse tcp:4000 tcp:4000` maps
// the phone's localhost:4000 to the dev machine's backend, so no WiFi LAN IP
// is needed. If you switch to a WiFi/Expo-Go-over-network setup instead,
// change this back to the dev machine's LAN IP (check with `ipconfig`), or
// "10.0.2.2" if you move to an Android emulator.
const DEV_HOST = "localhost";

export const API_BASE_URL = `http://${DEV_HOST}:4000`;

export const api = axios.create({ baseURL: API_BASE_URL });

const TOKEN_KEY = "nikal_auth_token";

export async function setAuthToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export async function loadStoredToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  return token;
}
