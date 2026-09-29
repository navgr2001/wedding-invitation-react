const MAX_IMAGE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
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

const isImageFile = (file) =>
  Boolean(file && ALLOWED_IMAGE_TYPES.has(file.type));

const isVideoFile = (file) =>
  Boolean(file && ALLOWED_VIDEO_TYPES.has(file.type));

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

/**
 * IMPORTANT:
 *
 * The ViewModel expects this function to RETURN an error string
 * rather than throw an exception.
 */
export function validateGuestMediaFile(file) {
  if (!file) {
    return "Please select a photo or video.";
  }

  if (!isImageFile(file) && !isVideoFile(file)) {
    return (
      "This file type is not supported. " +
      "Please select a JPG, PNG, WEBP, HEIC, MP4, MOV, WEBM, M4V, or 3GP file."
    );
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

/**
 * Ask Apps Script to create a Google Drive resumable-upload
 * session.
 *
 * The Google OAuth access token remains completely server-side.
 */
async function createResumableSession({
  endpoint,
  eventToken,
  guestName,
  file,
}) {
  const response = await fetch(endpoint, {
    method: "POST",

    /*
     * Keep text/plain to avoid an unnecessary CORS preflight
     * when calling the Apps Script web app.
     */
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify({
      action: "guestMediaUploadStart",

      eventToken,

      guestName: guestName?.trim() || "",

      fileName: file.name,

      mimeType: file.type,

      fileSize: file.size,
    }),
  });

  const result = await readJsonResponse(response);

  if (!response.ok || !result.success || !result.uploadUrl) {
    throw new Error(result.message || "Unable to prepare the upload.");
  }

  return result;
}

/**
 * Upload the actual File directly from the guest's browser
 * to the secure Google Drive resumable-upload URL.
 *
 * This avoids:
 *
 * FileReader
 * Base64
 * huge JSON
 * Apps Script receiving the video bytes
 *
 * XMLHttpRequest is deliberately used here because its
 * upload event provides actual network upload progress.
 */
function uploadDirectlyToDrive({ uploadUrl, file, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl, true);

    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      /*
       * Keep 100% for final server-side verification.
       */
      const percent = Math.min(
        99,
        Math.max(1, Math.round((event.loaded / event.total) * 99)),
      );

      onProgress?.({
        stage: "uploading",

        uploadedBytes: event.loaded,

        totalBytes: event.total,

        percent,
      });
    };

    xhr.onerror = () => {
      reject(
        new Error(
          "The upload was interrupted. Please check your connection and try again.",
        ),
      );
    };

    xhr.onabort = () => {
      reject(new Error("The upload was cancelled."));
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(
          new Error(
            "Google Drive could not complete the upload. Please try again.",
          ),
        );

        return;
      }

      try {
        const result = xhr.responseText ? JSON.parse(xhr.responseText) : {};

        resolve(result);
      } catch {
        reject(
          new Error("The upload completed but returned an invalid response."),
        );
      }
    };

    /*
     * IMPORTANT:
     * Send the native File object.
     *
     * No Base64 conversion.
     */
    xhr.send(file);
  });
}

/**
 * Ask Apps Script to verify the uploaded Drive file.
 */
async function finalizeUpload({ endpoint, eventToken, fileId }) {
  const response = await fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify({
      action: "guestMediaUploadFinalize",

      eventToken,

      fileId,
    }),
  });

  const result = await readJsonResponse(response);

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "The upload completed, but final verification failed.",
    );
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
  if (!endpoint) {
    throw new Error("Guest upload service is not configured.");
  }

  if (!eventToken) {
    throw new Error("Wedding upload token is not configured.");
  }

  const validationError = validateGuestMediaFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  /*
   * Stage 1:
   * Create Drive upload session.
   */
  onProgress?.({
    stage: "preparing",

    uploadedBytes: 0,

    totalBytes: file.size,

    percent: 0,
  });

  const session = await createResumableSession({
    endpoint,

    eventToken,

    guestName,

    file,
  });

  /*
   * Stage 2:
   * Upload directly to Google Drive.
   */
  const uploadedFile = await uploadDirectlyToDrive({
    uploadUrl: session.uploadUrl,

    file,

    onProgress,
  });

  if (!uploadedFile.id) {
    throw new Error("Google Drive did not return the uploaded file ID.");
  }

  /*
   * Stage 3:
   * Apps Script verifies the finished file.
   */
  onProgress?.({
    stage: "verifying",

    uploadedBytes: file.size,

    totalBytes: file.size,

    percent: 99,
  });

  const result = await finalizeUpload({
    endpoint,

    eventToken,

    fileId: uploadedFile.id,
  });

  onProgress?.({
    stage: "complete",

    uploadedBytes: file.size,

    totalBytes: file.size,

    percent: 100,
  });

  return result;
}

export {
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
};
