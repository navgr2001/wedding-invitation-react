import { useEffect, useRef, useState } from "react";
import { HeartIcon } from "../components/IconSvgs";
import { weddingContent } from "../../models/weddingContent";
import {
  cleanGuestName,
  isValidGuestName,
  NAME_MAX_LENGTH,
  RSVP_MAX_GUESTS,
  RSVP_MESSAGE_MAX_LENGTH,
} from "../../utils/guestFormValidation";

const normalizeName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function RsvpSection({ rsvp }) {
  const [name, setName] = useState("");
  const [names, setNames] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [messageLength, setMessageLength] = useState(0);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const reset = () => {
      setName("");
      setOpen(false);
      setActiveIndex(-1);
      setMessageLength(0);
    };
    window.addEventListener("wedding:rsvp-success", reset);
    return () => window.removeEventListener("wedding:rsvp-success", reset);
  }, []);

  const matches = name.trim()
    ? names
        .filter(
          (guest) =>
            isValidGuestName(guest) &&
            normalizeName(guest).includes(normalizeName(name)),
        )
        .sort(
          (a, b) =>
            Number(normalizeName(b).startsWith(normalizeName(name))) -
            Number(normalizeName(a).startsWith(normalizeName(name))),
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, []);

  const loadNames = () => {
    if (requestRef.current) {
      return requestRef.current;
    }

    const { googleSheetId, seatingTabName } = weddingContent.sheets;

    if (!googleSheetId || !seatingTabName) {
      return Promise.resolve([]);
    }

    requestRef.current = new Promise((resolve, reject) => {
      const callback = `__rsvpNames_${Date.now()}_${Math.floor(
        Math.random() * 100000,
      )}`;

      const url = new URL(
        `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq`,
      );

      url.searchParams.set("sheet", seatingTabName);
      url.searchParams.set("tqx", `out:json;responseHandler:${callback}`);
      url.searchParams.set("t", String(Date.now()));

      const script = document.createElement("script");
      let finished = false;

      const cleanup = () => {
        clearTimeout(timer);
        script.remove();
        delete window[callback];
      };

      const finish = (error, data) => {
        if (finished) return;

        finished = true;
        cleanup();

        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      };

      const timer = setTimeout(
        () => finish(new Error("Guest list timed out")),
        15000,
      );

      window[callback] = (payload) => {
        if (payload?.status === "error") {
          finish(new Error("Guest list unavailable"));
          return;
        }

        const list = (payload?.table?.rows || [])
          .map((row) => {
            const cell = row?.c?.[0];

            return String(cell?.v ?? cell?.f ?? "").trim();
          })
          .filter(Boolean);

        finish(null, [
          ...new Map(
            list.map((guest) => [normalizeName(guest), guest]),
          ).values(),
        ]);
      };

      script.onerror = () => finish(new Error("Guest list could not load"));

      script.src = url.toString();
      document.head.appendChild(script);
    })
      .then((list) => {
        setNames(list);
        return list;
      })
      .catch((error) => {
        console.error("RSVP name suggestions unavailable:", error);

        requestRef.current = null;
        return [];
      });

    return requestRef.current;
  };

  const selectName = (guest) => {
    setName(cleanGuestName(guest));
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <section className="section rsvpSection" id="rsvp">
      <div className="container">
        <div className="sectionHeader reveal">
          <h2 className="h2 timelineTitleV2">{rsvp.title}</h2>

          <p className="muted">{rsvp.description}</p>
        </div>

        <div className="rsvpGrid">
          <div className="rsvpPhotoCard reveal">
            <div className="rsvpPhotoCard__img">
              <img
                src={rsvp.photo}
                alt="Couple photo"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="rsvpSaveCard" aria-label="Save the Date">
              <div className="rsvpSaveCard__head">
                <span className="rsvpSaveCard__icon" aria-hidden="true">
                  <HeartIcon width={30} height={30} strokeWidth={2} />
                </span>

                <span className="rsvpSaveCard__title">Save the Date!</span>
              </div>

              <p className="rsvpSaveCard__text">
                Your presence will make our wedding day complete. We're so
                excited to celebrate this special moment with you!
              </p>
            </div>
          </div>

          <div className="rsvpFormCard reveal">
            <form
              className="rsvpForm"
              id="rsvpForm"
              method="POST"
              target="rsvp_hidden_iframe"
              action={rsvp.formAction}
            >
              <div className="fLabel">
                <label htmlFor="rsvpGuestName">Name</label>

                <div className="rsvpNameAutocomplete" ref={wrapperRef}>
                  <input
                    ref={inputRef}
                    id="rsvpGuestName"
                    className="fInput rsvpNameInput"
                    type="text"
                    name="name"
                    placeholder="Eg: Sam Colby"
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open && matches.length > 0}
                    aria-controls="rsvpNameSuggestions"
                    value={name}
                    maxLength={NAME_MAX_LENGTH}
                    pattern="[\p{L}\p{M}\p{N} &.]+"
                    title="Only letters, numbers, spaces, & and . are allowed (maximum 50 characters)."
                    onFocus={() => {
                      loadNames();

                      if (name.trim()) {
                        setOpen(true);
                      }
                    }}
                    onChange={(event) => {
                      const cleaned = cleanGuestName(event.target.value);
                      setName(cleaned);
                      setActiveIndex(-1);
                      setOpen(Boolean(cleaned.trim()));
                      loadNames();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setOpen(false);
                        return;
                      }

                      if (!open || !matches.length) {
                        return;
                      }

                      if (event.key === "ArrowDown") {
                        event.preventDefault();

                        setActiveIndex((index) => (index + 1) % matches.length);
                      } else if (event.key === "ArrowUp") {
                        event.preventDefault();

                        setActiveIndex(
                          (index) =>
                            (index - 1 + matches.length) % matches.length,
                        );
                      } else if (event.key === "Enter" && activeIndex >= 0) {
                        event.preventDefault();

                        selectName(matches[activeIndex]);
                      }
                    }}
                    required
                  />

                  {name && (
                    <button
                      type="button"
                      className="rsvpNameClear"
                      aria-label="Clear name"
                      title="Clear name"
                      onClick={() => {
                        setName("");
                        setOpen(false);
                        setActiveIndex(-1);
                        inputRef.current?.focus();
                      }}
                    >
                      &times;
                    </button>
                  )}

                  {open && matches.length > 0 && (
                    <div
                      className="rsvpNameSuggestions"
                      id="rsvpNameSuggestions"
                      role="listbox"
                      aria-label="Matching guest names"
                    >
                      {matches.map((guest, index) => (
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeIndex === index}
                          className={`rsvpNameSuggestion${
                            activeIndex === index ? " isActive" : ""
                          }`}
                          key={`${guest}-${index}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectName(guest)}
                        >
                          {guest}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rsvpTwoCols">
                <label className="fLabel">
                  Will you attend?
                  <select className="fInput" name="attendance" required>
                    <option value="">Select</option>

                    <option value="Yes, I'll be there">
                      Yes, I'll be there
                    </option>

                    <option value="Sorry, I can't make it">
                      Sorry, I can't make it
                    </option>
                  </select>
                </label>

                <label className="fLabel">
                  Number of Guests
                  <input
                    className="fInput"
                    type="number"
                    name="guests"
                    min="1"
                    max={RSVP_MAX_GUESTS}
                    step="1"
                    inputMode="numeric"
                    placeholder=""
                    required
                  />
                </label>
              </div>

              <label className="fLabel">
                Message
                <textarea
                  className="fInput fTextarea"
                  name="message"
                  rows="5"
                  placeholder="Leave the couple a beautiful note!"
                  autoComplete="off"
                  spellCheck={true}
                  maxLength={RSVP_MESSAGE_MAX_LENGTH}
                  onChange={(event) =>
                    setMessageLength(event.target.value.length)
                  }
                ></textarea>
                <small aria-live="polite">
                  {messageLength}/{RSVP_MESSAGE_MAX_LENGTH} characters
                  (including spaces)
                </small>
              </label>

              <button className="rsvpSubmitBtn" type="submit">
                Send RSVP with Love
              </button>
            </form>

            <iframe
              name="rsvp_hidden_iframe"
              id="rsvp_hidden_iframe"
              className="rsvpHiddenFrame"
              title="Hidden RSVP submit frame"
            ></iframe>

            <div className="rsvpSuccess" id="rsvpSuccess" hidden>
              <div className="rsvpSuccess__title">Thank you! 💛</div>

              <div className="rsvpSuccess__text">
                Your RSVP has been saved successfully.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RsvpSection;
