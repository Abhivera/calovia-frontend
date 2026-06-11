import axiosInstance from "./axiosInstance";
import { getApiUrl } from "@/config/api";

type UploadFile = Blob | { uri: string; name: string; type: string };

export async function uploadAndAnalyzeImage(
  file: UploadFile,
  description?: string
) {
  const formData = new FormData();
  formData.append("file", file as unknown as Blob);
  if (description) formData.append("description", description);
  const res = await axiosInstance.post("/images/upload-and-analyze", formData);
  return res.data;
}

export async function deleteImage(image_id: string) {
  const res = await axiosInstance.delete(`/images/${image_id}`);
  return res.data;
}

export async function getAllImages(params: Record<string, string | number | undefined> = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number>;
  const res = await axiosInstance.get("/images", { params: filtered });
  return res.data;
}

export async function updateImageIsMeal(image_id: string, is_meal: boolean) {
  const res = await axiosInstance.patch(`/images/is-meal/${image_id}`, {
    is_meal,
  });
  return res.data;
}

export async function relogImage(image_id: string) {
  const res = await axiosInstance.post(`/images/${image_id}/relog`);
  return res.data;
}

export async function publicAnalyzeFood(file: UploadFile, description?: string) {
  const formData = new FormData();
  formData.append("file", file as unknown as Blob);
  if (description) formData.append("description", description);
  const res = await fetch(getApiUrl("/public/analyze-food"), {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.detail || "Public food analysis failed");
  }
  return data;
}
