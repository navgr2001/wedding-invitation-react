import { useEffect, useMemo, useRef, useState } from "react";

import {
  uploadGuestMedia,
  validateGuestMediaFile,
} from "../../services/guestUpload/guestMediaUploadService";

const MAX_FILES_PER_BATCH = 10;

function createPreview(file) {
  const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    id: globalThis.crypto?.randomUUID?.() || fallbackId,

    file,

    previewUrl: URL.createObjectURL(file),

    type: file.type.startsWith("video/") ? "video" : "image",

    status: "ready",

    progress: 0,

    error: "",
  };
}

export function useGuestMediaUploadViewModel({
  endpoint,
  eventToken: configuredEventToken = "",
  maxFileSizeMb = 500,
}) {
  const [guestName, setGuestName] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [isUploading, setIsUploading] = useState(false);

  const [uploadedCount, setUploadedCount] = useState(0);

  const [message, setMessage] = useState(null);

  const selectedFilesRef = useRef([]);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  /*
   * Supports both:
   *
   * QR:
   * ?eventToken=ABC#guest-upload
   *
   * Direct visit:
   * token configured in weddingContent.js
   */
  const eventToken = useMemo(() => {
    const parameters = new URLSearchParams(window.location.search);

    return parameters.get("eventToken") || configuredEventToken || "";
  }, [configuredEventToken]);

  const addFiles = (incomingFiles) => {
    setMessage(null);

    const files = Array.from(incomingFiles || []);

    if (!files.length) {
      return;
    }

    const availableSlots = MAX_FILES_PER_BATCH - selectedFiles.length;

    if (availableSlots <= 0) {
      setMessage({
        type: "error",

        text: `You can upload up to ${MAX_FILES_PER_BATCH} files at a time.`,
      });

      return;
    }

    const filesToProcess = files.slice(0, availableSlots);

    const validFiles = [];
    const errors = [];

    filesToProcess.forEach((file) => {
      const validationError = validateGuestMediaFile(file, maxFileSizeMb);

      if (validationError) {
        errors.push(validationError);

        return;
      }

      validFiles.push(createPreview(file));
    });

    setSelectedFiles((current) => [...current, ...validFiles]);

    if (files.length > availableSlots) {
      errors.push(`Only ${availableSlots} additional files could be selected.`);
    }

    if (errors.length) {
      setMessage({
        type: "error",

        text: errors[0],
      });
    }
  };

  const removeFile = (id) => {
    if (isUploading) {
      return;
    }

    setSelectedFiles((current) => {
      const target = current.find((item) => item.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const clearFiles = () => {
    if (isUploading) {
      return;
    }

    selectedFiles.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
    });

    setSelectedFiles([]);

    setUploadedCount(0);

    setMessage(null);
  };

  const updateFile = (id, changes) => {
    setSelectedFiles((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
  };

  const uploadAll = async () => {
    if (isUploading || !selectedFiles.length) {
      return;
    }

    if (!eventToken) {
      setMessage({
        type: "error",

        text: "Wedding upload service is not configured correctly.",
      });

      return;
    }

    setIsUploading(true);

    setUploadedCount(0);

    setMessage(null);

    let successCount = 0;

    try {
      for (const item of selectedFiles) {
        updateFile(item.id, {
          status: "uploading",

          progress: 0,

          error: "",
        });

        try {
          await uploadGuestMedia({
            endpoint,

            eventToken,

            guestName,

            file: item.file,

            onProgress: ({ percent }) => {
              updateFile(item.id, {
                progress: percent,
              });
            },
          });

          successCount += 1;

          setUploadedCount(successCount);

          updateFile(item.id, {
            status: "uploaded",

            progress: 100,

            error: "",
          });
        } catch (error) {
          updateFile(item.id, {
            status: "failed",

            error: error?.message || "Unable to upload this file.",
          });
        }
      }

      if (successCount === selectedFiles.length) {
        setMessage({
          type: "success",

          text: "Your memories have been uploaded successfully. Thank you for sharing them with us! ♡",
        });
      } else if (successCount > 0) {
        setMessage({
          type: "warning",

          text:
            `${successCount} of ${selectedFiles.length} files uploaded successfully. ` +
            "Please retry the failed files.",
        });
      } else {
        setMessage({
          type: "error",

          text: "We couldn't upload the selected files. Please check your connection and try again.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    guestName,
    setGuestName,

    selectedFiles,

    isUploading,

    uploadedCount,

    message,

    eventToken,

    addFiles,
    removeFile,
    clearFiles,
    uploadAll,

    maxFiles: MAX_FILES_PER_BATCH,

    maxFileSizeMb,
  };
}
