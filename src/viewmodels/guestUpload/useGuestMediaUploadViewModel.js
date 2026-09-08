import { useEffect, useMemo, useRef, useState } from "react";

import {
  uploadGuestMedia,
  validateGuestMediaFile,
} from "../../services/guestUpload/guestMediaUploadService";

const MAX_FILES_PER_BATCH = 10;

function createPreview(file) {
  const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${
      globalThis.crypto?.randomUUID?.() || fallbackId
    }`,

    file,

    previewUrl: URL.createObjectURL(file),

    type: file.type.startsWith("video/") ? "video" : "image",

    status: "ready",

    error: "",
  };
}

export function useGuestMediaUploadViewModel({
  endpoint,
  eventToken: configuredEventToken = "",
  maxFileSizeMb = 25,
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
   * Support BOTH:
   *
   * 1. QR URL:
   *    ?eventToken=ABC#guest-upload
   *
   * 2. Normal website:
   *    uses configured wedding token.
   */
  const eventToken = useMemo(() => {
    const parameters = new URLSearchParams(window.location.search);

    const urlToken = parameters.get("eventToken");

    return urlToken || configuredEventToken || "";
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

    if (files.length > availableSlots) {
      errors.push(
        `Only the first ${availableSlots} additional files were selected.`,
      );
    }

    setSelectedFiles((current) => [...current, ...validFiles]);

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

  const uploadAll = async () => {
    if (isUploading || selectedFiles.length === 0) {
      return;
    }

    if (!eventToken) {
      setMessage({
        type: "error",

        text: "Wedding upload service is not configured correctly. Please contact the couple.",
      });

      return;
    }

    setIsUploading(true);

    setUploadedCount(0);

    setMessage(null);

    let successfulUploads = 0;

    try {
      for (const selectedFile of selectedFiles) {
        setSelectedFiles((current) =>
          current.map((item) =>
            item.id === selectedFile.id
              ? {
                  ...item,

                  status: "uploading",

                  error: "",
                }
              : item,
          ),
        );

        try {
          await uploadGuestMedia({
            endpoint,

            eventToken,

            guestName,

            file: selectedFile.file,
          });

          successfulUploads += 1;

          setUploadedCount(successfulUploads);

          setSelectedFiles((current) =>
            current.map((item) =>
              item.id === selectedFile.id
                ? {
                    ...item,

                    status: "uploaded",

                    error: "",
                  }
                : item,
            ),
          );
        } catch (error) {
          setSelectedFiles((current) =>
            current.map((item) =>
              item.id === selectedFile.id
                ? {
                    ...item,

                    status: "failed",

                    error: error?.message || "Unable to upload this file.",
                  }
                : item,
            ),
          );
        }
      }

      if (successfulUploads === selectedFiles.length) {
        setMessage({
          type: "success",

          text: "Your memories have been uploaded successfully. Thank you for sharing them with us! ♡",
        });
      } else if (successfulUploads > 0) {
        setMessage({
          type: "warning",

          text:
            `${successfulUploads} of ${selectedFiles.length} files were uploaded. ` +
            "Please try the failed files again.",
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

  const progress =
    selectedFiles.length > 0
      ? Math.round((uploadedCount / selectedFiles.length) * 100)
      : 0;

  return {
    guestName,

    setGuestName,

    selectedFiles,

    isUploading,

    uploadedCount,

    progress,

    message,

    addFiles,

    removeFile,

    clearFiles,

    uploadAll,

    maxFiles: MAX_FILES_PER_BATCH,

    maxFileSizeMb,
  };
}
