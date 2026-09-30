const DEFAULT_MAX_FILE_SIZE_MB = 30;
const FILE_HEADER_BYTES = 64;
const UPLOAD_CHUNK_SIZE = 16 * 1024 * 1024; // 16 MiB; Drive requires 256 KiB multiples.
const MAX_CHUNK_RETRIES = 4;
const CHUNK_TIMEOUT_MS = 120000;

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
  if (!file) return false;
  return ALLOWED_IMAGE_TYPES.has(file.type) || ALLOWED_VIDEO_TYPES.has(file.type);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
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

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function getUploadedEndFromRange(rangeHeader) {
  if (!rangeHeader) return null;
  const match = /bytes=0-(\d+)/i.exec(rangeHeader);
  return match ? Number(match[1]) : null;
}

function sendChunk({ uploadUrl, chunk, start, totalBytes, mimeType, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const end = start + chunk.size - 1;

    xhr.open("PUT", uploadUrl, true);
    xhr.timeout = CHUNK_TIMEOUT_MS;
    xhr.setRequestHeader("Content-Type", mimeType || "application/octet-stream");
    xhr.setRequestHeader("Content-Range", `bytes ${start}-${end}/${totalBytes}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const uploadedBytes = Math.min(totalBytes, start + event.loaded);
      onProgress?.({
        uploadedBytes,
        totalBytes,
        percent: Math.min(99, Math.round((uploadedBytes / totalBytes) * 100)),
      });
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve({ complete: true, nextByte: totalBytes });
        return;
      }

      if (xhr.status === 308) {
        const uploadedEnd = getUploadedEndFromRange(xhr.getResponseHeader("Range"));
        resolve({
          complete: false,
          nextByte: uploadedEnd == null ? end + 1 : uploadedEnd + 1,
        });
        return;
      }

      const retryable = xhr.status === 408 || xhr.status === 429 || xhr.status >= 500;
      const error = new Error(
        retryable
          ? "The connection was interrupted while uploading. Retrying…"
          : `Upload failed (${xhr.status || "network error"}).`,
      );
      error.retryable = retryable;
      reject(error);
    };

    xhr.onerror = () => {
      const error = new Error("The connection was interrupted while uploading. Retrying…");
      error.retryable = true;
      reject(error);
    };

    xhr.ontimeout = () => {
      const error = new Error("The upload timed out. Retrying…");
      error.retryable = true;
      reject(error);
    };

    xhr.send(chunk);
  });
}

async function uploadFileInChunks({ uploadUrl, file, onProgress }) {
  let offset = 0;

  while (offset < file.size) {
    const chunkEnd = Math.min(offset + UPLOAD_CHUNK_SIZE, file.size);
    const chunk = file.slice(offset, chunkEnd);
    let attempt = 0;

    while (true) {
      try {
        const result = await sendChunk({
          uploadUrl,
          chunk,
          start: offset,
          totalBytes: file.size,
          mimeType: file.type,
          onProgress,
        });

        if (result.complete) return;

        // Drive's 308 Range response is authoritative. This also prevents a
        // retry from re-sending bytes Drive has already committed.
        offset = Math.max(offset, result.nextByte);
        break;
      } catch (error) {
        attempt += 1;
        if (!error?.retryable || attempt > MAX_CHUNK_RETRIES) throw error;
        await wait(Math.min(1000 * 2 ** (attempt - 1), 8000));
      }
    }
  }
}

async function verifyCompletedUpload({ endpoint, eventToken, storedFileName, file }) {
  if (!storedFileName) return false;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "guestMediaUploadVerify",
        eventToken,
        storedFileName,
        fileSize: file.size,
      }),
    });

    const result = await readJsonResponse(response);
    return Boolean(response.ok && result.success && result.uploaded);
  } catch {
    return false;
  }
}

export function validateGuestMediaFile(
  file,
  maxImageSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
  maxVideoSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
) {
  if (!file) return "Invalid file.";

  if (!isAllowedFile(file)) {
    return "Only supported photos and videos can be uploaded.";
  }

  if (!file.size || file.size <= 0) {
    return `${file.name || "The selected file"} is empty.`;
  }

  const maxFileSizeMb = file.type.startsWith("video/")
    ? maxVideoSizeMb
    : maxImageSizeMb;
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
  if (!endpoint) throw new Error("Guest upload service is not configured.");
  if (!eventToken) throw new Error("Wedding upload token is not configured.");

  // Only the first 64 bytes are read locally for server-side signature
  // validation. The full file is never converted to Base64 or held in memory.
  const fileHeaderBase64 = arrayBufferToBase64(
    await file.slice(0, FILE_HEADER_BYTES).arrayBuffer(),
  );

  onProgress?.({ uploadedBytes: 0, totalBytes: file.size, percent: 0 });

  const initResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "guestMediaUploadInit",
      eventToken,
      guestName: guestName?.trim() || "",
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      fileHeaderBase64,
    }),
  });

  const initResult = await readJsonResponse(initResponse);
  if (!initResponse.ok || !initResult.success || !initResult.uploadUrl) {
    throw new Error(initResult.message || "Unable to start this upload.");
  }

  try {
    await uploadFileInChunks({
      uploadUrl: initResult.uploadUrl,
      file,
      onProgress,
    });
  } catch (error) {
    // A browser can report a cross-origin/network error after Drive has already
    // committed the final chunk. Verify the exact server-generated filename
    // before telling the guest that the upload failed.
    const uploaded = await verifyCompletedUpload({
      endpoint,
      eventToken,
      storedFileName: initResult.storedFileName,
      file,
    });

    if (!uploaded) throw error;
  }

  onProgress?.({ uploadedBytes: file.size, totalBytes: file.size, percent: 100 });
  return { success: true };
}
