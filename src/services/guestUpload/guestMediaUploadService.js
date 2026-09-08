const DEFAULT_MAX_FILE_SIZE_MB = 25;

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
]);

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

      resolve(result.substring(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(new Error(`Unable to read ${file.name}.`));
    };

    reader.readAsDataURL(file);
  });
}

function isAllowedFile(file) {
  return (
    ALLOWED_IMAGE_TYPES.has(file.type) || ALLOWED_VIDEO_TYPES.has(file.type)
  );
}

export function validateGuestMediaFile(
  file,
  maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
) {
  if (!file) {
    return "Invalid file.";
  }

  if (!isAllowedFile(file)) {
    return "Only photos and supported video files can be uploaded.";
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
}) {
  if (!endpoint) {
    throw new Error("Guest upload service is not configured.");
  }

  const base64 = await fileToBase64(file);

  const response = await fetch(endpoint, {
    method: "POST",

    /*
     * text/plain avoids an unnecessary JSON preflight
     * when communicating with the Apps Script web app.
     */
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify({
      action: "guestMediaUpload",
      eventToken,
      guestName: guestName.trim(),
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      base64,
    }),
  });

  if (!response.ok) {
    throw new Error("The upload service could not be reached.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Upload failed.");
  }

  return result;
}
