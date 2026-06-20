import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL,
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return response.data;
};

export const queryKnowledgeBase = async (query, topK = 5) => {
  const response = await api.post("/query", { query, top_k: topK });
  return response.data;
};

export const listDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

export const deleteDocument = async (filename) => {
  const response = await api.delete(
    `/documents/${encodeURIComponent(filename)}`,
  );
  return response.data;
};

export const clearAllDocuments = async () => {
  const response = await api.delete("/documents");
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};
