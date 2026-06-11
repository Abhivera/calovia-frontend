import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type UploadFile = Blob | { uri: string; name: string; type: string };

export function assetToUploadFile(
  asset: ImagePicker.ImagePickerAsset
): UploadFile {
  if (Platform.OS === "web" && asset.file) {
    return asset.file;
  }
  const ext = asset.uri.split(".").pop() ?? "jpg";
  return {
    uri: asset.uri,
    name: asset.fileName ?? `upload.${ext}`,
    type: asset.mimeType ?? "image/jpeg",
  };
}

export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}
