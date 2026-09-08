import { useCallback, useEffect, useRef, useState } from "react";

import {
  createUploadSession,
  RESUMABLE_CHUNK_SIZE,
  uploadChunk,
} from "../../services/guestUpload/guestMediaUploadService";

/*
 * Keep at least one chunk locally so that
 * we always have data available for the
 * final Drive request.
 */
const AUTO_UPLOAD_THRESHOLD = RESUMABLE_CHUNK_SIZE * 2;

function chooseRecorderMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function extensionFromMimeType(mimeType) {
  if (mimeType.includes("mp4")) {
    return "mp4";
  }

  return "webm";
}

export function useGuestVideoRecorder({
  endpoint,
  eventToken,
  guestName,
  maxDurationMinutes = 10,
}) {
  const streamRef = useRef(null);

  const recorderRef = useRef(null);

  const piecesRef = useRef([]);

  const bufferedBytesRef = useRef(0);

  const recordedBytesRef = useRef(0);

  const uploadedBytesRef = useRef(0);

  const sessionIdRef = useRef("");

  const uploadQueueRef = useRef(Promise.resolve());

  const timerRef = useRef(null);

  const startedAtRef = useRef(0);

  const [stream, setStream] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const [isFinalizing, setIsFinalizing] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [recordedBytes, setRecordedBytes] = useState(0);

  const [uploadedBytes, setUploadedBytes] = useState(0);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());

    streamRef.current = null;

    setStream(null);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);

      timerRef.current = null;
    }
  }, []);

  const resetRecordingState = useCallback(() => {
    piecesRef.current = [];

    bufferedBytesRef.current = 0;

    recordedBytesRef.current = 0;

    uploadedBytesRef.current = 0;

    sessionIdRef.current = "";

    uploadQueueRef.current = Promise.resolve();

    setElapsedSeconds(0);

    setRecordedBytes(0);

    setUploadedBytes(0);
  }, []);

  const openCamera = useCallback(async () => {
    setError("");

    setSuccessMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Video recording is not supported by this browser.");

      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("Video recording is not supported by this browser.");

      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },

          width: {
            ideal: 1920,
          },

          height: {
            ideal: 1080,
          },
        },

        audio: true,
      });

      streamRef.current = mediaStream;

      setStream(mediaStream);

      setIsCameraOpen(true);
    } catch (cameraError) {
      console.error(cameraError);

      setError(
        "Camera or microphone access was denied. Please allow camera and microphone permission and try again.",
      );
    }
  }, []);

  const appendPiece = useCallback((blob) => {
    piecesRef.current.push(blob);

    bufferedBytesRef.current += blob.size;

    recordedBytesRef.current += blob.size;

    setRecordedBytes(recordedBytesRef.current);
  }, []);

  const uploadBufferedChunk = useCallback(async () => {
    if (bufferedBytesRef.current < AUTO_UPLOAD_THRESHOLD) {
      return;
    }

    const combined = new Blob(piecesRef.current);

    const chunk = combined.slice(0, RESUMABLE_CHUNK_SIZE);

    const remaining = combined.slice(RESUMABLE_CHUNK_SIZE);

    piecesRef.current = remaining.size > 0 ? [remaining] : [];

    bufferedBytesRef.current = remaining.size;

    const offset = uploadedBytesRef.current;

    await uploadChunk({
      endpoint,

      eventToken,

      sessionId: sessionIdRef.current,

      chunk,

      offset,

      final: false,

      totalSize: null,
    });

    uploadedBytesRef.current += chunk.size;

    setUploadedBytes(uploadedBytesRef.current);
  }, [endpoint, eventToken]);

  const enqueueAutoUpload = useCallback(() => {
    uploadQueueRef.current = uploadQueueRef.current
      .then(async () => {
        while (bufferedBytesRef.current >= AUTO_UPLOAD_THRESHOLD) {
          await uploadBufferedChunk();
        }
      })
      .catch((uploadError) => {
        console.error(uploadError);

        setError(
          uploadError?.message || "Video upload failed while recording.",
        );

        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      });
  }, [uploadBufferedChunk]);

  const finalizeRecording = useCallback(async () => {
    setIsFinalizing(true);

    clearTimer();

    try {
      await uploadQueueRef.current;

      const remainingBlob = new Blob(piecesRef.current, {
        type: recorderRef.current?.mimeType || "video/webm",
      });

      const totalSize = recordedBytesRef.current;

      if (remainingBlob.size <= 0) {
        throw new Error("The recorded video is empty.");
      }

      await uploadChunk({
        endpoint,

        eventToken,

        sessionId: sessionIdRef.current,

        chunk: remainingBlob,

        offset: uploadedBytesRef.current,

        final: true,

        totalSize,
      });

      uploadedBytesRef.current = totalSize;

      setUploadedBytes(totalSize);

      piecesRef.current = [];

      bufferedBytesRef.current = 0;

      setSuccessMessage("Your video was recorded and saved successfully. ♡");
    } catch (finalizeError) {
      console.error(finalizeError);

      setError(
        finalizeError?.message ||
          "Unable to finish uploading the recorded video.",
      );
    } finally {
      setIsFinalizing(false);

      setIsRecording(false);
    }
  }, [clearTimer, endpoint, eventToken]);

  const startRecording = useCallback(async () => {
    if (!streamRef.current || isRecording || isFinalizing) {
      return;
    }

    setError("");

    setSuccessMessage("");

    resetRecordingState();

    try {
      const mimeType = chooseRecorderMimeType();

      const extension = extensionFromMimeType(mimeType);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const fileName = `wedding-video-${timestamp}.${extension}`;

      const session = await createUploadSession({
        endpoint,

        eventToken,

        guestName,

        fileName,

        mimeType: mimeType || "video/webm",

        /*
         * Unknown while the guest
         * is still recording.
         */
        totalSize: null,
      });

      sessionIdRef.current = session.sessionId;

      const recorder = new MediaRecorder(
        streamRef.current,
        mimeType
          ? {
              mimeType,

              /*
               * Around 4 Mbps.
               * Good balance for a
               * wedding website.
               */
              videoBitsPerSecond: 4_000_000,
            }
          : undefined,
      );

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (!event.data || event.data.size === 0) {
          return;
        }

        appendPiece(event.data);

        enqueueAutoUpload();
      };

      recorder.onerror = (event) => {
        console.error(event);

        setError("Recording failed unexpectedly.");
      };

      recorder.onstop = () => {
        void finalizeRecording();
      };

      /*
       * Ask MediaRecorder for data
       * approximately every second.
       *
       * The resulting data is combined
       * into proper 4 MB Drive chunks.
       */
      recorder.start(1000);

      startedAtRef.current = Date.now();

      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);

        setElapsedSeconds(elapsed);

        if (elapsed >= maxDurationMinutes * 60) {
          if (recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
          }
        }
      }, 1000);

      setIsRecording(true);
    } catch (startError) {
      console.error(startError);

      setError(startError?.message || "Unable to start video recording.");
    }
  }, [
    appendPiece,
    enqueueAutoUpload,
    endpoint,
    eventToken,
    finalizeRecording,
    guestName,
    isFinalizing,
    isRecording,
    maxDurationMinutes,
    resetRecordingState,
  ]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (isRecording || isFinalizing) {
      return;
    }

    clearTimer();

    stopTracks();

    setIsCameraOpen(false);
  }, [clearTimer, isFinalizing, isRecording, stopTracks]);

  useEffect(() => {
    return () => {
      clearTimer();

      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }

      stopTracks();
    };
  }, [clearTimer, stopTracks]);

  return {
    stream,

    isCameraOpen,
    isRecording,
    isFinalizing,

    elapsedSeconds,

    recordedBytes,
    uploadedBytes,

    pendingBytes: Math.max(0, recordedBytes - uploadedBytes),

    error,

    successMessage,

    openCamera,
    startRecording,
    stopRecording,
    closeCamera,
  };
}
