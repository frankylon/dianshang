"use client";

import { useState, useRef } from "react";
import { Upload, X, Image, Video, Loader2 } from "lucide-react";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: "image" | "video" | "both";
  label?: string;
}

export function FileUpload({ value, onChange, accept = "both", label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = accept === "image"
    ? "image/jpeg,image/png,image/webp,image/gif"
    : accept === "video"
    ? "video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

  async function handleUpload(file: File) {
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  const isImage = value && (value.includes("/images/") || value.match(/\.(jpg|jpeg|png|webp|gif)$/i));
  const isVideo = value && (value.includes("/videos/") || value.match(/\.(mp4|webm|mov)$/i));

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}

      {value ? (
        <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
          {isImage && (
            <img src={value} alt="Upload" className="w-full h-40 object-cover" />
          )}
          {isVideo && (
            <video src={value} className="w-full h-40 object-cover" controls />
          )}
          {!isImage && !isVideo && (
            <div className="h-20 flex items-center justify-center">
              <p className="text-sm text-gray-500 font-mono">{value}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                {accept !== "video" && <Image className="w-6 h-6" />}
                {accept !== "image" && <Video className="w-6 h-6" />}
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-500">
                Drop file here or <span className="text-blue-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400">Max 50MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Manual URL input fallback */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste URL directly..."
        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
