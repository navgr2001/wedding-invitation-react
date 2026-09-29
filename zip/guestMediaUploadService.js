const MAX_IMAGE_SIZE_BYTES = 30 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;
const UPLOAD_CHUNK_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB; multiple of Drive's 256 KB requirement.

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
]);
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/webm", "video/x-m4v", "video/3gpp",
]);

export const isImageFile = (file) => Boolean(file && ALLOWED_IMAGE_TYPES.has(file.type));
export const isVideoFile = (file) => Boolean(file && ALLOWED_VIDEO_TYPES.has(file.type));

export function validateGuestMediaFile(file) {
  if (!file) return "Please select a photo or video.";
  if (!isImageFile(file) && !isVideoFile(file)) {
    return "This file type is not supported. Please select a JPG, PNG, WEBP, HEIC, MP4, MOV, WEBM, M4V, or 3GP file.";
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return `${file.name || "The selected file"} is empty or invalid.`;
  }
  if (isImageFile(file) && file.size > MAX_IMAGE_SIZE_BYTES) {
    return `${file.name} is larger than the 30 MB photo limit.`;
  }
  if (isVideoFile(file) && file.size > MAX_VIDEO_SIZE_BYTES) {
    return `${file.name} is larger than the 500 MB video limit.`;
  }
  return null;
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The wedding upload service returned an invalid response.");
  }
}

async function postJson(endpoint, payload) {
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to reach the upload service. Please check your connection and try again.");
  }

  const result = await readJsonResponse(response);
  if (!response.ok || result.success === false) {
    throw new Error(result.message || "The upload service could not complete the request.");
  }
  return result;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.onload = () => {
      const value = String(reader.result || "");
      const commaIndex = value.indexOf(",");
      if (commaIndex < 0) {
        reject(new Error("Unable to prepare the selected file."));
        return;
      }
      resolve(value.slice(commaIndex + 1));
    };
    reader.readAsDataURL(blob);
  });
}

async function startUpload({ endpoint, eventToken, guestName, file }) {
  const result = await postJson(endpoint, {
    action: "guestMediaUploadStart",
    eventToken,
    guestName: guestName?.trim() || "",
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  if (!result.uploadId) {
    throw new Error("The upload service did not create an upload session.");
  }
  return result.uploadId;
}

async function sendChunk({ endpoint, eventToken, uploadId, file, start, end }) {
  const chunk = file.slice(start, end);
  const base64 = await blobToBase64(chunk);

  return postJson(endpoint, {
    action: "guestMediaUploadChunk",
    eventToken,
    uploadId,
    start,
    endExclusive: end,
    totalSize: file.size,
    base64,
  });
}

async function finalizeUpload({ endpoint, eventToken, uploadId }) {
  return postJson(endpoint, {
    action: "guestMediaUploadFinalize",
    eventToken,
    uploadId,
  });
}

async function cancelUpload({ endpoint, eventToken, uploadId }) {
  if (!uploadId) return;
  try {
    await postJson(endpoint, {
      action: "guestMediaUploadCancel",
      eventToken,
      uploadId,
    });
  } catch {
    // Best-effort cleanup only. Preserve the original upload error.
  }
}

export async function uploadGuestMedia({ endpoint, eventToken, guestName, file, onProgress }) {
  if (!endpoint) throw new Error("Guest upload service is not configured.");
  if (!eventToken) throw new Error("Wedding upload token is not configured.");

  const validationError = validateGuestMediaFile(file);
  if (validationError) throw new Error(validationError);

  let uploadId = "";

  try {
    onProgress?.({ stage: "preparing", uploadedBytes: 0, totalBytes: file.size, percent: 0 });
    uploadId = await startUpload({ endpoint, eventToken, guestName, file });

    let start = 0;
    while (start < file.size) {
      const end = Math.min(start + UPLOAD_CHUNK_SIZE_BYTES, file.size);
      await sendChunk({ endpoint, eventToken, uploadId, file, start, end });
      start = end;

      const percent = Math.min(98, Math.max(1, Math.round((start / file.size) * 98)));
      onProgress?.({ stage: "uploading", uploadedBytes: start, totalBytes: file.size, percent });
    }

    onProgress?.({ stage: "verifying", uploadedBytes: file.size, totalBytes: file.size, percent: 99 });
    const result = await finalizeUpload({ endpoint, eventToken, uploadId });
    onProgress?.({ stage: "complete", uploadedBytes: file.size, totalBytes: file.size, percent: 100 });
    return result;
  } catch (error) {
    await cancelUpload({ endpoint, eventToken, uploadId });
    throw error;
  }
}

export {
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  UPLOAD_CHUNK_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
};
