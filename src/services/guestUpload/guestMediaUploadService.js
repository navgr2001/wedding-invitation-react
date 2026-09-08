const DEFAULT_MAX_FILE_SIZE_MB = 500;

export const RESUMABLE_CHUNK_SIZE = 4 * 1024 * 1024;

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

function isAllowedFile(file) {
  if (!file) {
    return false;
  }

  return (
    ALLOWED_IMAGE_TYPES.has(file.type) || ALLOWED_VIDEO_TYPES.has(file.type)
  );
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
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

export async function createUploadSession({
  endpoint,
  eventToken,
  guestName,
  fileName,
  mimeType,
  totalSize = null,
}) {
  if (!endpoint) {
    throw new Error("Guest upload backend is not configured.");
  }

  if (!eventToken) {
    throw new Error("Wedding upload token is not configured.");
  }

  const response = await fetch(`${endpoint}/resumable/start`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      "X-Wedding-Event-Token": eventToken,
    },

    body: JSON.stringify({
      guestName: guestName?.trim() || "",

      fileName,

      mimeType,

      totalSize,
    }),
  });

  const result = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Unable to start the upload.");
  }

  if (!result.sessionId) {
    throw new Error("Upload session was not created.");
  }

  return result;
}

export async function uploadChunk({
  endpoint,
  eventToken,
  sessionId,
  chunk,
  offset,
  final = false,
  totalSize = null,
}) {
  const response = await fetch(
    `${endpoint}/resumable/${encodeURIComponent(sessionId)}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/octet-stream",

        "X-Wedding-Event-Token": eventToken,

        "X-Upload-Offset": String(offset),

        "X-Upload-Final": final ? "1" : "0",

        ...(totalSize !== null
          ? {
              "X-Upload-Total": String(totalSize),
            }
          : {}),
      },

      body: chunk,
    },
  );

  const result = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "A part of the upload failed.");
  }

  return result;
}

export async function uploadGuestMedia({
  endpoint,
  eventToken,
  guestName,
  file,
  onProgress,
}) {
  const session = await createUploadSession({
    endpoint,
    eventToken,
    guestName,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    totalSize: file.size,
  });

  let offset = 0;

  while (offset < file.size) {
    const end = Math.min(offset + RESUMABLE_CHUNK_SIZE, file.size);

    const chunk = file.slice(offset, end);

    const final = end === file.size;

    await uploadChunk({
      endpoint,
      eventToken,

      sessionId: session.sessionId,

      chunk,

      offset,

      final,

      totalSize: file.size,
    });

    offset = end;

    onProgress?.({
      uploadedBytes: offset,
      totalBytes: file.size,
      percent: Math.round((offset / file.size) * 100),
    });
  }

  return {
    success: true,

    sessionId: session.sessionId,
  };
}
