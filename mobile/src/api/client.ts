import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const API_BASE_URL = "https://nikal-lapx.onrender.com";

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
