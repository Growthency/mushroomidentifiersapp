/**
 * Image upload to Supabase Storage.
 */
import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system";

export async function uploadScanImage(
  userId: string,
  scanId: string,
  angle: string,
  localUri: string,
): Promise<string> {
  const ext = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${scanId}/${angle}.${ext}`;
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decodeBase64(base64);

  const { error } = await supabase.storage.from("scans").upload(path, arrayBuffer, {
    contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("scans").getPublicUrl(path);
  return data.publicUrl;
}

function decodeBase64(b64: string): Uint8Array {
  const bin = globalThis.atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function readImageAsBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}
