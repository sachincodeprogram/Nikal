import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Testing on a physical phone over Expo Go: it must reach the backend via
// the dev machine's LAN IP (not "localhost" — that would mean the phone
// itself). Both must be on the same WiFi network. Update this if your
// machine's IP changes (check with `ipconfig`), or switch back to
// "10.0.2.2" if you move to an Android emulator instead.
const DEV_HOST = "192.168.1.50";

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
