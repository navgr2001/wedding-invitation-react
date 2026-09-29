const MAX_IMAGE_SIZE_BYTES = 30 * 1024 * 1024; // Keep existing image limit
const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

const isImageFile = (file) => file?.type?.startsWith("image/");
const isVideoFile = (file) => file?.type?.startsWith("video/");

export const validateGuestMediaFile = (file) => {
  if (!file) {
    throw new Error("Please select a photo or video.");
  }

  if (!isImageFile(file) && !isVideoFile(file)) {
    throw new Error("Only photo and video files are allowed.");
  }

  if (isImageFile(file) && file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Photos must be 30 MB or smaller.");
  }

  if (isVideoFile(file) && file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error("Videos must be 500 MB or smaller.");
  }

  return true;
};
