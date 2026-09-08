import { useRef, useState } from "react";

import { useGuestMediaUploadViewModel } from "../../viewmodels/guestUpload/useGuestMediaUploadViewModel";

const UploadIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <path
      d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />

    <path
      d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  </svg>
);

const CameraIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <path
      d="M8.5 6.5 10 4.5h4l1.5 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2.5Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.7"
    />

    <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const GalleryIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <rect
      height="15"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.7"
      width="18"
      x="3"
      y="4.5"
    />

    <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />

    <path
      d="m5.5 17 4.2-4.2 2.7 2.6 2-2 4.1 3.6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);

const CheckIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <path
      d="m6.5 12.5 3.4 3.4 7.6-8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

function GuestUploadSection({ guestUpload }) {
  const libraryInputRef = useRef(null);

  const cameraInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const {
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
    maxFiles,
    maxFileSizeMb,
  } = useGuestMediaUploadViewModel({
    endpoint: guestUpload.endpoint,

    eventToken: guestUpload.eventToken,

    maxFileSizeMb: guestUpload.maxFileSizeMb,
  });

  const openLibraryPicker = (event) => {
    event?.stopPropagation();

    if (!isUploading) {
      libraryInputRef.current?.click();
    }
  };

  const openCamera = (event) => {
    event?.stopPropagation();

    if (!isUploading) {
      cameraInputRef.current?.click();
    }
  };

  const handleLibraryChange = (event) => {
    addFiles(event.target.files);

    /*
     * Reset so the guest can select
     * the same file again if needed.
     */
    event.target.value = "";
  };

  const handleCameraChange = (event) => {
    addFiles(event.target.files);

    event.target.value = "";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();

    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    if (!isUploading) {
      addFiles(event.dataTransfer.files);
    }
  };

  return (
    <section className="section guestUploadSection" id="guest-upload">
      <div className="container guestUploadSection__container">
        <div className="sectionHeader reveal guestUploadHeader">
          <span className="guestUploadHeader__eyebrow">
            Share the celebration
          </span>

          <h2 className="h2 timelineTitleV2">{guestUpload.title}</h2>

          <p className="muted guestUploadHeader__description">
            {guestUpload.description}
          </p>
        </div>

        <div className="guestUploadCard reveal">
          <div className="guestUploadCard__intro">
            <span aria-hidden="true" className="guestUploadCard__icon">
              <CameraIcon />
            </span>

            <div>
              <h3>Share what you captured</h3>

              <p>
                Choose existing photos or videos from your device, or take a new
                photo right now. We'd love to see our wedding day through your
                eyes.
              </p>
            </div>
          </div>

          <div className="guestUploadField">
            <label htmlFor="guestUploadName">
              Your name
              <span> optional</span>
            </label>

            <input
              autoComplete="name"
              disabled={isUploading}
              id="guestUploadName"
              maxLength={80}
              onChange={(event) => setGuestName(event.target.value)}
              placeholder="e.g. Nimal & Family"
              type="text"
              value={guestName}
            />
          </div>

          {/* =========================================
              Hidden native file inputs
              ========================================= */}

          <input
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm,video/x-m4v"
            className="guestUploadNativeInput"
            disabled={isUploading}
            multiple
            onChange={handleLibraryChange}
            ref={libraryInputRef}
            type="file"
          />

          {/*
           * capture="environment"
           *
           * On supported Android/iPhone browsers,
           * this requests the rear-facing camera.
           *
           * On devices/browsers that do not
           * support direct capture, the browser
           * falls back to its normal image picker.
           */}
          <input
            accept="image/*"
            capture="environment"
            className="guestUploadNativeInput"
            disabled={isUploading}
            onChange={handleCameraChange}
            ref={cameraInputRef}
            type="file"
          />

          {/* =========================================
              Main actions
              ========================================= */}

          <div className="guestUploadActions">
            <button
              className="guestUploadAction guestUploadAction--library"
              disabled={isUploading}
              onClick={openLibraryPicker}
              type="button"
            >
              <span aria-hidden="true" className="guestUploadAction__icon">
                <GalleryIcon />
              </span>

              <span className="guestUploadAction__content">
                <strong>Choose Photos & Videos</strong>

                <small>Select memories already saved on your device</small>
              </span>
            </button>

            <button
              className="guestUploadAction guestUploadAction--camera"
              disabled={isUploading}
              onClick={openCamera}
              type="button"
            >
              <span aria-hidden="true" className="guestUploadAction__icon">
                <CameraIcon />
              </span>

              <span className="guestUploadAction__content">
                <strong>Take a Photo</strong>

                <small>Open your device camera</small>
              </span>
            </button>
          </div>

          {/* Desktop drag/drop enhancement */}

          <div
            className={`guestUploadDropzone guestUploadDropzone--compact ${
              isDragging ? "isDragging" : ""
            }`}
            onClick={openLibraryPicker}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                openLibraryPicker(event);
              }
            }}
            role="button"
            tabIndex={isUploading ? -1 : 0}
          >
            <span
              aria-hidden="true"
              className="guestUploadDropzone__icon guestUploadDropzone__icon--small"
            >
              <UploadIcon />
            </span>

            <strong>Drag & drop from a computer</strong>

            <small>
              Up to {maxFiles} files at a time · maximum {maxFileSizeMb} MB per
              file
            </small>
          </div>

          {selectedFiles.length > 0 && (
            <div className="guestUploadSelection">
              <div className="guestUploadSelection__header">
                <div>
                  <strong>Selected memories</strong>

                  <span>
                    {selectedFiles.length}{" "}
                    {selectedFiles.length === 1 ? "file" : "files"}
                  </span>
                </div>

                {!isUploading && (
                  <button
                    className="guestUploadClearBtn"
                    onClick={clearFiles}
                    type="button"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="guestUploadPreviewGrid">
                {selectedFiles.map((item) => (
                  <article
                    className={`guestUploadPreview guestUploadPreview--${item.status}`}
                    key={item.id}
                  >
                    <div className="guestUploadPreview__media">
                      {item.type === "image" ? (
                        <img alt="" src={item.previewUrl} />
                      ) : (
                        <video
                          muted
                          playsInline
                          preload="metadata"
                          src={item.previewUrl}
                        />
                      )}

                      {item.status === "uploaded" && (
                        <span
                          aria-label="Uploaded"
                          className="guestUploadPreview__success"
                        >
                          <CheckIcon />
                        </span>
                      )}

                      {!isUploading && item.status !== "uploaded" && (
                        <button
                          aria-label={`Remove ${item.file.name}`}
                          className="guestUploadPreview__remove"
                          onClick={() => removeFile(item.id)}
                          type="button"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="guestUploadPreview__details">
                      <strong title={item.file.name}>{item.file.name}</strong>

                      <small>{formatFileSize(item.file.size)}</small>

                      {item.status === "uploading" && (
                        <small className="guestUploadPreview__status">
                          Uploading…
                        </small>
                      )}

                      {item.status === "uploaded" && (
                        <small className="guestUploadPreview__status guestUploadPreview__status--success">
                          Uploaded
                        </small>
                      )}

                      {item.status === "failed" && (
                        <small className="guestUploadPreview__status guestUploadPreview__status--error">
                          {item.error || "Upload failed"}
                        </small>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div aria-live="polite" className="guestUploadProgress">
              <div className="guestUploadProgress__top">
                <span>Uploading your memories…</span>

                <span>
                  {uploadedCount}/{selectedFiles.length}
                </span>
              </div>

              <div className="guestUploadProgress__track">
                <span
                  className="guestUploadProgress__bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <small>
                Please keep this page open until the upload finishes.
              </small>
            </div>
          )}

          {message && (
            <div
              aria-live="polite"
              className={`guestUploadMessage guestUploadMessage--${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
            >
              {message.text}
            </div>
          )}

          <button
            className="guestUploadSubmitBtn"
            disabled={isUploading || selectedFiles.length === 0}
            onClick={uploadAll}
            type="button"
          >
            <span aria-hidden="true">
              <UploadIcon />
            </span>

            {isUploading
              ? "Uploading…"
              : selectedFiles.length > 0
                ? `Upload ${selectedFiles.length} ${
                    selectedFiles.length === 1 ? "memory" : "memories"
                  }`
                : "Select memories to upload"}
          </button>

          <p className="guestUploadPrivacy">
            Your uploads are sent directly to the couple's private wedding Drive
            folder and are not displayed publicly on this page.
          </p>
        </div>
      </div>
    </section>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default GuestUploadSection;
