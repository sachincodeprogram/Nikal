import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Alert } from "react-native";
import { storage } from "../config/firebase";

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

async function pickImage(source: "camera" | "library"): Promise<string | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission chahiye", "Photo lene ke liye camera/gallery access do (Settings me).");
    return null;
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });

  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
}

/**
 * Shows a Camera/Gallery chooser, uploads the picked image to Firebase
 * Storage under `${storagePath}/<timestamp>.jpg`, and returns its public
 * download URL — or null if the user cancelled or upload failed.
 */
export function pickAndUploadImage(
  storagePath: string,
  onUploading?: (uploading: boolean) => void
): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert("Photo select karo", undefined, [
      { text: "Camera", onPress: () => run("camera") },
      { text: "Gallery", onPress: () => run("library") },
      { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
    ]);

    async function run(source: "camera" | "library") {
      const uri = await pickImage(source);
      if (!uri) {
        resolve(null);
        return;
      }
      try {
        onUploading?.(true);
        const blob = await uriToBlob(uri);
        const fileRef = ref(storage, `${storagePath}/${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        const url = await getDownloadURL(fileRef);
        resolve(url);
      } catch (err: any) {
        Alert.alert("Upload nahi hua", err?.message ?? "Kuch galat ho gaya");
        resolve(null);
      } finally {
        onUploading?.(false);
      }
    }
  });
}
