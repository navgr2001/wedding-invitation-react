const DEFAULT_MAX_FILE_SIZE_MB = 500;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/3gpp",
]);

function isAllowedFile(file) {
  if (!file) {
    return false;
  }

  return (
    ALLOWED_IMAGE_TYPES.has(file.type) || ALLOWED_VIDEO_TYPES.has(file.type)
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");

      if (commaIndex === -1) {
        reject(new Error("Unable to read the selected file."));
        return;
      }

      resolve(result.slice(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected file."));
    };

    reader.readAsDataURL(file);
  });
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The wedding upload service returned an invalid response.");
  }
}

export function validateGuestMediaFile(
  file,
  maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
) {
  if (!file) {
    return "Invalid file.";
  }

  if (!isAllowedFile(file)) {
    return "Only supported photos and videos can be uploaded.";
  }

  if (!file.size || file.size <= 0) {
    return `${file.name || "The selected file"} is empty.`;
  }

  const maximumBytes = maxFileSizeMb * 1024 * 1024;

  if (file.size > maximumBytes) {
    return `${file.name} is larger than ${maxFileSizeMb} MB.`;
  }

  return null;
}

export async function uploadGuestMedia({
  endpoint,
  eventToken,
  guestName,
  file,
  onProgress,
}) {
  if (!endpoint) {
    throw new Error("Guest upload service is not configured.");
  }

  if (!eventToken) {
    throw new Error("Wedding upload token is not configured.");
  }

  const base64 = await fileToBase64(file);

  onProgress?.({
    uploadedBytes: 0,
    totalBytes: file.size,
    percent: 25,
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "guestMediaUpload",
      eventToken,
      guestName: guestName?.trim() || "",
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      base64,
    }),
  });

  onProgress?.({
    uploadedBytes: Math.round(file.size * 0.75),
    totalBytes: file.size,
    percent: 75,
  });

  const result = await readJsonResponse(response);

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to upload this file.");
  }

  onProgress?.({
    uploadedBytes: file.size,
    totalBytes: file.size,
    percent: 100,
  });

  return result;
}
