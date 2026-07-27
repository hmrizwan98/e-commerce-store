"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { deleteUploadedImageAction } from "@/lib/images/actions";
import { IMAGE_PRESETS, type ImageType } from "@/lib/images/presets";
import { ALLOWED_MIME_TYPES, MAX_ORIGINAL_FILE_SIZE_BYTES, friendlyMimeList } from "@/lib/images/validate";

export interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  imageType: ImageType;
  subfolder?: string;
  multiple?: boolean;
  label?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

type QueueStatus = "preparing" | "compressing" | "uploading" | "done" | "error";

interface UploadResult {
  url: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
}

interface QueueItem {
  id: string;
  file: File;
  fileName: string;
  status: QueueStatus;
  progress: number;
  error?: string;
  originalSize: number;
  originalWidth?: number;
  originalHeight?: number;
  result?: UploadResult;
}

const STAGE_LABEL: Record<QueueStatus, string> = {
  preparing: "Preparing image…",
  compressing: "Compressing…",
  uploading: "Uploading…",
  done: "Completed",
  error: "Failed",
};

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    createImageBitmap(file)
      .then((bitmap) => {
        const dims = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        resolve(dims);
      })
      .catch(() => reject(new Error("This file appears to be corrupted.")));
  });
}

function uploadWithProgress(
  blob: Blob,
  fileName: string,
  imageType: ImageType,
  subfolder: string | undefined,
  onProgress: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.set("file", blob, fileName);
    formData.set("imageType", imageType);
    if (subfolder) formData.set("subfolder", subfolder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body as UploadResult);
        } else {
          reject(new Error(body.error || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  imageType,
  subfolder,
  multiple = true,
  label = "Images",
  onUploadingChange,
}) => {
  const preset = IMAGE_PRESETS[imageType];
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialValueRef = useRef<Set<string>>(new Set(value));

  const anyInFlight = queue.some((q) => q.status !== "done" && q.status !== "error");
  useEffect(() => {
    onUploadingChange?.(anyInFlight);
  }, [anyInFlight, onUploadingChange]);

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const processFile = async (file: File, existingId?: string) => {
    const id = existingId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (existingId) {
      updateItem(id, { status: "preparing", progress: 0, error: undefined });
    } else {
      setQueue((prev) => [
        ...prev,
        { id, file, fileName: file.name, status: "preparing", progress: 0, originalSize: file.size },
      ]);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      updateItem(id, { status: "error", error: `Unsupported file type. Allowed: ${friendlyMimeList()}` });
      return;
    }
    if (file.size > MAX_ORIGINAL_FILE_SIZE_BYTES) {
      updateItem(id, {
        status: "error",
        error: `Exceeds ${Math.round(MAX_ORIGINAL_FILE_SIZE_BYTES / (1024 * 1024))}MB max size`,
      });
      return;
    }

    let dims: { width: number; height: number };
    try {
      dims = await readImageDimensions(file);
    } catch (err) {
      updateItem(id, { status: "error", error: err instanceof Error ? err.message : "Corrupted file" });
      return;
    }
    updateItem(id, { originalWidth: dims.width, originalHeight: dims.height });

    updateItem(id, { status: "compressing", progress: 0 });
    let compressed: Blob;
    try {
      compressed = await imageCompression(file, {
        maxWidthOrHeight: preset.maxDimension,
        maxSizeMB: (preset.targetMaxKB ?? 400) / 1024,
        initialQuality: preset.quality / 100,
        fileType: "image/webp",
        useWebWorker: true,
        onProgress: (percent: number) => updateItem(id, { progress: percent }),
      });
    } catch {
      updateItem(id, { status: "error", error: "Compression failed" });
      return;
    }

    updateItem(id, { status: "uploading", progress: 0 });
    try {
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const result = await uploadWithProgress(compressed, `${baseName}.webp`, imageType, subfolder, (percent) =>
        updateItem(id, { progress: percent })
      );
      updateItem(id, { status: "done", progress: 100, result });
      onChange(multiple ? [...value, result.url] : [result.url]);
    } catch (err) {
      updateItem(id, { status: "error", error: err instanceof Error ? err.message : "Upload failed" });
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    Array.from(files).forEach((file) => {
      processFile(file).catch(() => {});
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAt = async (index: number) => {
    const url = value[index];
    onChange(value.filter((_, i) => i !== index));
    if (url && !initialValueRef.current.has(url)) {
      try {
        await deleteUploadedImageAction(url);
      } catch {
        // best-effort cleanup only
      }
    }
  };

  const dismissQueueItem = (id: string) => {
    toastedErrorsRef.current.delete(id);
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const retryItem = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    toastedErrorsRef.current.delete(id);
    processFile(item.file, id).catch(() => {});
  };

  const toastedErrorsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    queue.forEach((q) => {
      if (q.status === "error" && !toastedErrorsRef.current.has(q.id)) {
        toastedErrorsRef.current.add(q.id);
        toast.error(`${q.fileName}: ${q.error}`);
      }
    });
  }, [queue]);

  const hasImages = value.length > 0;
  const activeQueue = queue;

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {hasImages && (
        <div className="flex flex-wrap gap-3 mb-3">
          {value.map((url, index) => (
            <div
              key={url + index}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                title="Remove image"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
              >
                ×
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                  {multiple ? "Featured" : "Current"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeQueue.length > 0 && (
        <div className="mb-3 space-y-2">
          {activeQueue.map((q) => (
            <div
              key={q.id}
              className={`rounded-xl border p-3 text-sm space-y-1.5 ${
                q.status === "error"
                  ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                  : q.status === "done"
                  ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate max-w-[55%] flex items-center gap-1.5">
                  {q.status === "done" && <CheckCircleIcon className="w-4 h-4 text-green-600 shrink-0" />}
                  {q.status === "error" && <ExclamationCircleIcon className="w-4 h-4 text-red-600 shrink-0" />}
                  {q.fileName}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs ${
                      q.status === "error"
                        ? "text-red-600 dark:text-red-400"
                        : q.status === "done"
                        ? "text-green-700 dark:text-green-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {q.status === "error" ? q.error : STAGE_LABEL[q.status]}
                  </span>
                  {q.status === "error" && (
                    <button
                      type="button"
                      onClick={() => retryItem(q.id)}
                      title="Retry upload"
                      className="flex items-center gap-1 text-xs font-medium text-primary-700 dark:text-primary-400 hover:underline"
                    >
                      <ArrowPathIcon className="w-3.5 h-3.5" /> Retry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => dismissQueueItem(q.id)}
                    title="Dismiss"
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    ×
                  </button>
                </div>
              </div>
              {q.status !== "done" && q.status !== "error" && (
                <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-primary-6000 transition-all"
                    style={{ width: `${q.progress}%` }}
                  />
                </div>
              )}
              {q.status === "done" && q.result && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatSize(q.originalSize)}
                  {q.originalWidth ? ` · ${q.originalWidth}×${q.originalHeight}` : ""} → optimized{" "}
                  {formatSize(q.result.optimizedSize)} · {q.result.width}×{q.result.height} · WebP
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
          isDraggingOver
            ? "border-primary-6000 bg-primary-6000/5"
            : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <CloudArrowUpIcon className="w-9 h-9 mx-auto text-neutral-400" />
        <p className="text-sm font-medium mt-2">
          {hasImages && !multiple ? "Click or drag to replace image" : "Click or drag & drop to upload"}
        </p>
        <p className="text-xs text-neutral-500 mt-1">{friendlyMimeList()} · Max {Math.round(MAX_ORIGINAL_FILE_SIZE_BYTES / (1024 * 1024))}MB</p>
      </div>
    </div>
  );
};

export default ImageUploader;
