import { useEffect } from "react";

export function useWeddingInteractions() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent duplicate listeners during development refreshes.
    if (window.__WEDDING_INVITATION_INTERACTIONS_READY__) return;
    window.__WEDDING_INVITATION_INTERACTIONS_READY__ = true;

    /* ================================
       Interactions (client-side):
       - Envelope open (wax seal)
       - Background music (starts on wax click)
       - Countdown timer
       - Scroll reveal animations
       - Timeline scroll progress
       - RSVP submit success (hidden iframe)
       - Words of Love: fetch from public Google Sheet + infinite carousel
       - Gallery lightbox
       ================================ */

    (() => {
      "use strict";

      const qs = (selector, root = document) => root.querySelector(selector);
      const qsa = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

      const on = (el, evt, handler, opts) => {
        if (!el) return;
        el.addEventListener(evt, handler, opts);
      };

      /* -------------------------------------------------
         CONFIG
         ------------------------------------------------- */
      const APPS_SCRIPT_WEBAPP_URL =
        "https://script.google.com/macros/s/AKfycbyDZ8T3Qru7FGbVZOLm8TE4Eb47nD7p8YzHvfROR2Er40cwbC9B_Fhthbimj8eDdUB2cw/exec";

      const GOOGLE_SHEET_ID = "1_D3_kgP8MUqUyuPEvJ7gVwwCwRT7oSMqu3vA_06DZJM";
      const GOOGLE_SHEET_TAB_NAME = "RSVP Responses";
      const SEATING_ORDER_SHEET_TAB_NAME = "Seating Order";

      function hasConfiguredAppsScript() {
        return (
          typeof APPS_SCRIPT_WEBAPP_URL === "string" &&
          APPS_SCRIPT_WEBAPP_URL.trim() !== "" &&
          /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(
            APPS_SCRIPT_WEBAPP_URL.trim(),
          )
        );
      }

      function hasConfiguredSheet() {
        return (
          typeof GOOGLE_SHEET_ID === "string" &&
          GOOGLE_SHEET_ID.trim() !== "" &&
          typeof GOOGLE_SHEET_TAB_NAME === "string" &&
          GOOGLE_SHEET_TAB_NAME.trim() !== ""
        );
      }

      function buildAppsScriptUrl(params = {}) {
        const url = new URL(APPS_SCRIPT_WEBAPP_URL);
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
        return url.toString();
      }

      function buildSheetJsonpUrl(callbackName) {
        const url = new URL(
          `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq`,
        );

        url.searchParams.set("sheet", GOOGLE_SHEET_TAB_NAME);
        url.searchParams.set("tqx", `out:json;responseHandler:${callbackName}`);
        url.searchParams.set("t", String(Date.now()));

        return url.toString();
      }

      function loadScriptJsonp(url, callbackName, timeoutMs = 15000) {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          let finished = false;
          let timeoutId = null;

          const cleanup = () => {
            if (timeoutId) window.clearTimeout(timeoutId);
            try {
              delete window[callbackName];
            } catch {
              window[callbackName] = undefined;
            }
            if (script.parentNode) script.parentNode.removeChild(script);
          };

          window[callbackName] = (payload) => {
            if (finished) return;
            finished = true;
            cleanup();
            resolve(payload);
          };

          script.onerror = () => {
            if (finished) return;
            finished = true;
            cleanup();
            reject(new Error("JSONP request failed"));
          };

          timeoutId = window.setTimeout(() => {
            if (finished) return;
            finished = true;
            cleanup();
            reject(new Error("JSONP request timed out"));
          }, timeoutMs);

          script.src = url;
          document.head.appendChild(script);
        });
      }

      function initBackgroundMusic() {
        const bgMusic = qs("#bgMusic");
        if (!bgMusic) return { tryStart: () => {} };

        let hasLoadedOnce = false;
        let isTryingToStart = false;

        const notifyMusicState = () => {
          window.dispatchEvent(
            new CustomEvent("wedding:music-state", {
              detail: {
                muted: bgMusic.muted,
                paused: bgMusic.paused,
              },
            }),
          );
        };

        bgMusic.volume = 0.9;
        bgMusic.addEventListener("play", notifyMusicState);
        bgMusic.addEventListener("pause", notifyMusicState);
        bgMusic.addEventListener("volumechange", notifyMusicState);

        const tryStart = async () => {
          if (isTryingToStart || (!bgMusic.paused && !bgMusic.ended)) return;

          try {
            isTryingToStart = true;
            bgMusic.volume = 0.9;

            // Important: do not call load() on every user click/key press.
            // Calling load() resets the audio position, which made the song restart.
            if (!hasLoadedOnce && bgMusic.readyState === 0) {
              bgMusic.load();
              hasLoadedOnce = true;
            }

            await bgMusic.play();
            notifyMusicState();
          } catch (e) {
            console.warn("Music autoplay blocked:", e);
          } finally {
            isTryingToStart = false;
          }
        };

        return { tryStart };
      }

      function initEnvelopeIntro(tryStartMusic) {
        const envelopeIntro = qs("#envelopeIntro");
        const waxBtn = qs("#waxBtn");
        if (!envelopeIntro) return;

        let hasOpened = false;

        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => envelopeIntro.classList.add("isReady"));

        const removeMusicFallbacks = () => {
          window.removeEventListener("pointerdown", startMusicFallback, true);
          window.removeEventListener("keydown", startMusicFallback, true);
        };

        const openEnvelope = async () => {
          if (hasOpened) return;
          hasOpened = true;
          removeMusicFallbacks();

          await tryStartMusic();

          envelopeIntro.classList.add("isOpen");
          document.body.classList.add("isInviteEntering");

          window.setTimeout(() => {
            envelopeIntro.remove();
            document.body.style.overflow = "";
            window.setTimeout(
              () => document.body.classList.remove("isInviteEntering"),
              900,
            );

            const topbar = qs("#topbar");
            if (topbar && typeof topbar.scrollIntoView === "function") {
              topbar.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 820);
        };

        const startMusicFallback = () => tryStartMusic();

        on(waxBtn, "click", openEnvelope);
        on(window, "pointerdown", startMusicFallback, { capture: true });
        on(window, "keydown", startMusicFallback, { capture: true });

        on(window, "keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            const active = document.activeElement;
            if (active === waxBtn || envelopeIntro.contains(active)) {
              e.preventDefault();
              openEnvelope();
            }
          }
          if (e.key === "Escape") openEnvelope();
        });
      }

      function initNavMenu() {
        const btn = document.getElementById("navToggle");
        const nav = document.getElementById("nav");
        if (!btn || !nav) return;

        const setState = (open) => {
          nav.classList.toggle("isOpen", open);
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        };

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          setState(!nav.classList.contains("isOpen"));
        });

        nav.querySelectorAll("a").forEach((a) => {
          a.addEventListener("click", () => setState(false));
        });

        document.addEventListener("click", (e) => {
          if (!nav.classList.contains("isOpen")) return;
          if (nav.contains(e.target) || btn.contains(e.target)) return;
          setState(false);
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") setState(false);
        });

        window.addEventListener("resize", () => {
          if (window.matchMedia("(min-width: 721px)").matches) setState(false);
        });
      }

      function initCountdown() {
        const targetDate = new Date("2026-12-10T00:00:00+05:30");

        const getUnitEl = (unit) => qs(`[data-unit="${unit}"]`);
        const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");

        let ticker = null;
        let hasShownWeddingAnimation = false;

        function showWeddingCountdownEndAnimation() {
          if (hasShownWeddingAnimation) return;

          hasShownWeddingAnimation = true;

          const daysEl = getUnitEl("days");
          const countdownSection =
            daysEl?.closest("section") ||
            qs(".countdownSection") ||
            qs("#countdown") ||
            document.body;

          countdownSection.classList.add("countdownSection--completed");

          const oldCompleteMessage = countdownSection.querySelector(
            ".countdownCompleteMessage",
          );

          if (oldCompleteMessage) {
            oldCompleteMessage.remove();
          }

          const completeMessage = document.createElement("div");
          completeMessage.className = "countdownCompleteMessage";
          completeMessage.innerHTML = `
      <div class="countdownCompleteMessage__sparkles" aria-hidden="true">
        <span>♡</span>
        <span>✦</span>
        <span>♡</span>
      </div>

      <p class="countdownCompleteMessage__eyebrow">The wait is over</p>

      <h3 class="countdownCompleteMessage__title">
        Today We Celebrate Love
      </h3>

      <p class="countdownCompleteMessage__text">
        Our forever begins today. Thank you for being part of this beautiful celebration.
      </p>
    `;

          const countdownGrid =
            countdownSection.querySelector(".countdownGrid") ||
            countdownSection.querySelector(".countdown") ||
            countdownSection.querySelector("[data-unit='days']")?.parentElement
              ?.parentElement;

          if (countdownGrid) {
            countdownGrid.insertAdjacentElement("afterend", completeMessage);
          } else {
            countdownSection.appendChild(completeMessage);
          }

          const floatingHearts = document.createElement("div");
          floatingHearts.className = "countdownWeddingHearts";
          floatingHearts.setAttribute("aria-hidden", "true");

          floatingHearts.innerHTML = Array.from({ length: 18 })
            .map((_, index) => `<span style="--i:${index};">♡</span>`)
            .join("");

          countdownSection.appendChild(floatingHearts);

          window.setTimeout(() => {
            floatingHearts.remove();
          }, 6500);
        }

        const update = () => {
          const now = new Date();
          const diff = targetDate.getTime() - now.getTime();
          const done = diff <= 0;
          const total = Math.max(0, diff);

          const seconds = Math.floor(total / 1000) % 60;
          const minutes = Math.floor(total / (1000 * 60)) % 60;
          const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
          const days = Math.floor(total / (1000 * 60 * 60 * 24));

          const elDays = getUnitEl("days");
          const elHours = getUnitEl("hours");
          const elMinutes = getUnitEl("minutes");
          const elSeconds = getUnitEl("seconds");

          if (elDays) elDays.textContent = done ? "00" : String(days);
          if (elHours) elHours.textContent = pad2(hours);
          if (elMinutes) elMinutes.textContent = pad2(minutes);
          if (elSeconds) elSeconds.textContent = pad2(seconds);

          if (done) {
            showWeddingCountdownEndAnimation();

            if (ticker) {
              window.clearInterval(ticker);
            }
          }
        };

        update();
        ticker = window.setInterval(update, 1000);
      }

      function initScrollReveal() {
        const revealEls = qsa(".reveal");
        if (!revealEls.length) return;

        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("isVisible");
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.14 },
        );

        revealEls.forEach((el) => obs.observe(el));
      }

      function initTimelineProgress() {
        const timelineEl = qs("#timelineV2");
        if (!timelineEl) return;

        const timelineItems = qsa(".tlItem");
        const clamp01 = (n) => Math.max(0, Math.min(1, n));

        function update() {
          const rect = timelineEl.getBoundingClientRect();
          const vh = window.innerHeight || 0;
          const probeY = vh * 0.55;
          const progress = clamp01(
            (probeY - rect.top) / Math.max(1, rect.height),
          );

          timelineEl.style.setProperty("--tl-progress", `${progress * 100}%`);

          const sectionTop = rect.top;
          timelineItems.forEach((item) => {
            const r = item.getBoundingClientRect();
            const itemMid = r.top + r.height * 0.5;
            const isActive = itemMid < probeY && itemMid > sectionTop - 80;
            item.classList.toggle("isActive", isActive);
          });
        }

        let raf = 0;
        function onScrollOrResize() {
          if (raf) return;
          raf = window.requestAnimationFrame(() => {
            raf = 0;
            update();
          });
        }

        on(window, "scroll", onScrollOrResize, { passive: true });
        on(window, "resize", onScrollOrResize);
        update();
      }

      function initRsvpSubmission() {
        const form = qs("#rsvpForm");
        const iframe = qs("#rsvp_hidden_iframe");
        const success = qs("#rsvpSuccess");
        if (!form || !iframe || !success) return;

        let submitted = false;

        if (hasConfiguredAppsScript()) {
          form.action = buildAppsScriptUrl({ action: "submit" });
        }

        on(form, "submit", (event) => {
          if (!hasConfiguredAppsScript()) {
            event.preventDefault();
            window.alert("Apps Script submit URL is not configured correctly.");
            return;
          }

          submitted = true;
          success.hidden = true;

          const btn = form.querySelector("button[type='submit']");
          if (btn) {
            btn.disabled = true;
            btn.textContent = "Sending...";
            btn.style.opacity = "0.9";
          }
        });

        on(iframe, "load", () => {
          if (!submitted) return;

          window.setTimeout(() => {
            success.hidden = false;
            form.reset();

            const btn = form.querySelector("button[type='submit']");
            if (btn) {
              btn.disabled = false;
              btn.textContent = "Send RSVP with Love";
              btn.style.opacity = "1";
            }

            submitted = false;

            if (typeof window.__refreshWordsCarousel === "function") {
              window.__refreshWordsCarousel({ poll: true });
            }
          }, 600);
        });
      }

      function initWordsCarousel() {
        const track = qs("#wordsTrack");
        const dotsWrap = qs("#wordsDots");
        const carousel = qs("#wordsCarousel");
        if (!track || !dotsWrap || !carousel) return;

        let slides = [];
        let index = 1;
        let width = 0;
        let timer = null;
        let pollTimer = null;
        let isAnimating = false;
        let lastFingerprint = "";

        const AUTO_DELAY = 3000;
        const TRANSITION_MS = 900;
        const POLL_INTERVAL_MS = 5000;

        const escapeHtml = (value) =>
          String(value == null ? "" : value).replace(/[&<>"']/g, (m) => {
            const map = {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            };
            return map[m] || m;
          });

        function makeFingerprint(items) {
          return JSON.stringify(items);
        }

        function buildDots(count) {
          dotsWrap.innerHTML = "";

          for (let i = 0; i < count; i++) {
            const btn = document.createElement("button");
            btn.className = "wordsDot";
            btn.type = "button";
            btn.setAttribute("aria-label", `Go to message ${i + 1}`);
            btn.addEventListener("click", () => goTo(i + 1));
            dotsWrap.appendChild(btn);
          }

          setActiveDot();
        }

        function setActiveDot() {
          if (!slides.length) return;

          const realCount = slides.length;
          const realIndex = (((index - 1) % realCount) + realCount) % realCount;

          Array.from(dotsWrap.children).forEach((dot, i) => {
            dot.classList.toggle("isActive", i === realIndex);
          });
        }

        function applyTransform(useTransition = true) {
          track.style.transition = useTransition
            ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : "none";

          track.style.transform = `translate3d(${-index * width}px, 0, 0)`;
        }

        function setWidth() {
          if (!track.children.length) return;
          width = carousel.clientWidth;
          applyTransform(false);
          track.offsetHeight;
          applyTransform(true);
        }

        function goTo(targetIndex) {
          if (isAnimating || slides.length <= 1) return;
          isAnimating = true;
          index = targetIndex;
          setActiveDot();
          applyTransform(true);
        }

        function next() {
          goTo(index + 1);
        }

        function start() {
          stop();
          if (slides.length <= 1) return;
          timer = window.setInterval(next, AUTO_DELAY);
        }

        function stop() {
          if (timer) {
            window.clearInterval(timer);
            timer = null;
          }
        }

        function stopPolling() {
          if (pollTimer) {
            window.clearInterval(pollTimer);
            pollTimer = null;
          }
        }

        function renderEmptyState(message) {
          stop();
          slides = [];
          index = 0;
          isAnimating = false;

          track.style.transition = "none";
          track.style.transform = "translate3d(0,0,0)";
          track.innerHTML = `
            <div class="wordsSlide wordsSlide--empty" role="group" aria-label="No guest messages yet">
              <div class="wordsSlide__inner">
                <p class="wordsQuote wordsQuote--empty">${escapeHtml(
                  message || "No wishes have been submitted yet.",
                )}</p>
              </div>
            </div>
          `;
          dotsWrap.innerHTML = "";
        }

        function renderSlides(items) {
          if (!items.length) {
            renderEmptyState("No wishes have been submitted yet.");
            return;
          }

          slides = items;

          const slideHtml = slides.map((item) => {
            const message = escapeHtml(item.message);
            const name = escapeHtml(item.name);

            return `
              <div class="wordsSlide" role="group" aria-label="Guest message">
                <div class="wordsSlide__inner">
                  <p class="wordsQuote">"${message}"</p>
                  <p class="wordsBy">- ${name}</p>
                </div>
              </div>
            `;
          });

          const first = slideHtml[0];
          const last = slideHtml[slideHtml.length - 1];

          track.innerHTML = last + slideHtml.join("") + first;

          index = 1;
          isAnimating = false;
          buildDots(slides.length);

          window.requestAnimationFrame(() => {
            setWidth();
            start();
          });
        }

        function normalizeItemsFromSheet(gvizPayload) {
          const table = gvizPayload && gvizPayload.table;
          const rows = (table && table.rows) || [];

          return rows
            .map((row) => {
              const cells = row.c || [];

              const nameCell = cells[1];
              const attendanceCell = cells[2];
              const messageCell = cells[4];

              const name = String(
                nameCell && (nameCell.v ?? nameCell.f)
                  ? (nameCell.v ?? nameCell.f)
                  : "",
              ).trim();

              const attendance = String(
                attendanceCell && (attendanceCell.v ?? attendanceCell.f)
                  ? (attendanceCell.v ?? attendanceCell.f)
                  : "",
              ).trim();

              const message = String(
                messageCell && (messageCell.v ?? messageCell.f)
                  ? (messageCell.v ?? messageCell.f)
                  : "",
              ).trim();

              return { name, attendance, message };
            })
            .filter((item) => item.name !== "" && item.message !== "")
            .filter((item) => item.attendance !== "Sorry, I can't make it")
            .reverse()
            .slice(0, 30)
            .map((item) => ({
              name: item.name,
              message: item.message,
            }));
        }

        async function fetchWordsOnce() {
          if (!hasConfiguredSheet()) {
            throw new Error("Google Sheet source is not configured.");
          }

          const callbackName = `__sheetWordsCallback_${Date.now()}_${Math.floor(
            Math.random() * 100000,
          )}`;

          const url = buildSheetJsonpUrl(callbackName);
          const payload = await loadScriptJsonp(url, callbackName, 15000);
          return normalizeItemsFromSheet(payload);
        }

        async function refreshWords(options = {}) {
          stop();

          try {
            let items = await fetchWordsOnce();

            if (options.poll && !items.length) {
              for (let i = 0; i < 4; i++) {
                await new Promise((resolve) =>
                  window.setTimeout(resolve, 1200),
                );
                items = await fetchWordsOnce();
                if (items.length) break;
              }
            }

            const nextFingerprint = makeFingerprint(items);

            if (nextFingerprint !== lastFingerprint) {
              lastFingerprint = nextFingerprint;
              renderSlides(items);
            } else if (slides.length > 1 && !timer) {
              start();
            } else if (!slides.length && !items.length) {
              renderEmptyState("No wishes have been submitted yet.");
            }
          } catch (error) {
            console.error("Words of Love load failed:", error);
            renderEmptyState(
              "Unable to load wishes right now. Please check the Google Sheet settings.",
            );
          }
        }

        function startPolling() {
          stopPolling();
          pollTimer = window.setInterval(() => {
            if (!document.hidden) {
              refreshWords();
            }
          }, POLL_INTERVAL_MS);
        }

        track.addEventListener("transitionend", () => {
          const realCount = slides.length;
          if (!realCount) return;

          if (index === realCount + 1) {
            index = 1;
            applyTransform(false);
            track.offsetHeight;
            applyTransform(true);
          } else if (index === 0) {
            index = realCount;
            applyTransform(false);
            track.offsetHeight;
            applyTransform(true);
          }

          setActiveDot();
          isAnimating = false;
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        carousel.addEventListener("touchstart", stop, { passive: true });
        carousel.addEventListener("touchend", start, { passive: true });

        window.addEventListener("resize", setWidth);
        window.addEventListener("focus", () => refreshWords());
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) refreshWords();
        });

        window.__refreshWordsCarousel = refreshWords;

        refreshWords();
        startPolling();
      }

      function initSeatFinder() {
        const card = qs(".seatFinderCard");
        const form = qs(".seatFinderForm");
        const input = qs("#seatGuestName");
        const button = qs(".seatFinderButton");

        if (!card || !form || !input || !button) return;

        let seatingList = [];
        let activeSuggestions = [];
        let selectedGuest = null;
        let highlightedIndex = -1;
        let isLoaded = false;
        let isLoading = false;

        const suggestions = document.createElement("div");
        suggestions.className = "seatFinderSuggestions";
        suggestions.hidden = true;
        suggestions.setAttribute("role", "listbox");

        const result = document.createElement("div");
        result.className = "seatFinderResult";
        result.hidden = true;

        form.insertAdjacentElement("afterend", suggestions);
        suggestions.insertAdjacentElement("afterend", result);

        const normalize = (value) =>
          String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        const toDisplayName = (value) =>
          String(value || "")
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

        const escapeHtml = (value) =>
          String(value == null ? "" : value).replace(/[&<>"']/g, (m) => {
            const map = {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            };
            return map[m] || m;
          });

        function buildSeatingSheetJsonpUrl(callbackName) {
          const url = new URL(
            `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq`,
          );

          url.searchParams.set("sheet", SEATING_ORDER_SHEET_TAB_NAME);
          url.searchParams.set(
            "tqx",
            `out:json;responseHandler:${callbackName}`,
          );
          url.searchParams.set("t", String(Date.now()));

          return url.toString();
        }

        function normalizeSeatingRows(gvizPayload) {
          const table = gvizPayload && gvizPayload.table;
          const rows = (table && table.rows) || [];

          return rows
            .map((row) => {
              const cells = row.c || [];

              const nameCell = cells[0];
              const tableNoCell = cells[1];
              const messageCell = cells[2];

              const name = String(
                nameCell && (nameCell.v ?? nameCell.f)
                  ? (nameCell.v ?? nameCell.f)
                  : "",
              ).trim();

              const tableNo = String(
                tableNoCell && (tableNoCell.v ?? tableNoCell.f)
                  ? (tableNoCell.v ?? tableNoCell.f)
                  : "",
              ).trim();

              const message = String(
                messageCell && (messageCell.v ?? messageCell.f)
                  ? (messageCell.v ?? messageCell.f)
                  : "",
              ).trim();

              return {
                name,
                displayName: toDisplayName(name),
                normalizedName: normalize(name),
                tableNo,
                message,
              };
            })
            .filter((item) => item.name !== "" && item.tableNo !== "");
        }

        async function loadSeatingList() {
          if (isLoaded || isLoading) return seatingList;

          if (!hasConfiguredSheet()) {
            throw new Error("Google Sheet source is not configured.");
          }

          isLoading = true;

          try {
            const callbackName = `__seatingOrderCallback_${Date.now()}_${Math.floor(
              Math.random() * 100000,
            )}`;

            const url = buildSeatingSheetJsonpUrl(callbackName);
            const payload = await loadScriptJsonp(url, callbackName, 15000);

            seatingList = normalizeSeatingRows(payload);
            isLoaded = true;

            return seatingList;
          } finally {
            isLoading = false;
          }
        }

        function showMessage(message, type = "error") {
          result.hidden = false;
          result.className = `seatFinderResult seatFinderResult--${type}`;
          result.innerHTML = `
      <p class="seatFinderResult__message">${escapeHtml(message)}</p>
    `;
        }

        function hideResult() {
          result.hidden = true;
          result.innerHTML = "";
        }

        function hideSuggestions() {
          suggestions.hidden = true;
          suggestions.innerHTML = "";
          highlightedIndex = -1;
        }

        function renderSuggestions(items) {
          activeSuggestions = items;
          highlightedIndex = -1;

          if (!items.length) {
            suggestions.hidden = false;
            suggestions.innerHTML = `
        <div class="seatFinderSuggestion seatFinderSuggestion--empty">
          No matching guest found
        </div>
      `;
            return;
          }

          suggestions.hidden = false;
          suggestions.innerHTML = items
            .map(
              (item, index) => `
          <button
            type="button"
            class="seatFinderSuggestion"
            data-seat-index="${index}"
            role="option"
          >
            ${escapeHtml(item.name)}
          </button>
        `,
            )
            .join("");
        }

        function filterGuests(value) {
          const query = normalize(value);

          if (!query) {
            selectedGuest = null;
            hideSuggestions();
            hideResult();
            return;
          }

          const startsWithMatches = seatingList.filter((item) =>
            item.normalizedName.startsWith(query),
          );

          const includesMatches = seatingList.filter(
            (item) =>
              !item.normalizedName.startsWith(query) &&
              item.normalizedName.includes(query),
          );

          renderSuggestions(
            [...startsWithMatches, ...includesMatches].slice(0, 8),
          );
        }

        function selectGuest(item) {
          if (!item) return;

          selectedGuest = item;
          input.value = item.name;
          hideSuggestions();
          hideResult();
          input.focus();
        }

        function findGuestByInput() {
          const query = normalize(input.value);

          if (!query) return null;

          const exactMatch = seatingList.find(
            (item) => item.normalizedName === query,
          );
          if (exactMatch) return exactMatch;

          const startsWithMatch = seatingList.find((item) =>
            item.normalizedName.startsWith(query),
          );
          if (startsWithMatch) return startsWithMatch;

          return seatingList.find((item) =>
            item.normalizedName.includes(query),
          );
        }

        function showSeatResult(item) {
          if (!item) {
            showMessage(
              "Sorry, we could not find that name. Please check the spelling and try again.",
            );
            return;
          }

          selectedGuest = item;
          input.value = item.name;
          hideSuggestions();

          result.hidden = false;
          result.className = "seatFinderResult seatFinderResult--success";
          result.innerHTML = `
      <p class="seatFinderResult__welcome">
        Welcome, ${escapeHtml(item.displayName)}
      </p>

      <h3 class="seatFinderResult__title">
        Your table number is ${escapeHtml(item.tableNo)}
      </h3>

      <p class="seatFinderResult__text">
        ${escapeHtml(item.message || "We are so happy to celebrate with you.")}
      </p>
    `;
        }

        function updateHighlightedSuggestion(nextIndex) {
          const suggestionButtons = Array.from(
            suggestions.querySelectorAll(
              ".seatFinderSuggestion:not(.seatFinderSuggestion--empty)",
            ),
          );

          if (!suggestionButtons.length) return;

          highlightedIndex =
            (nextIndex + suggestionButtons.length) % suggestionButtons.length;

          suggestionButtons.forEach((item, index) => {
            item.classList.toggle("isActive", index === highlightedIndex);
          });
        }

        input.addEventListener("focus", async () => {
          try {
            await loadSeatingList();
            filterGuests(input.value);
          } catch (error) {
            console.error("Seating order load failed:", error);
            showMessage("Unable to load seating details right now.");
          }
        });

        input.addEventListener("input", async () => {
          selectedGuest = null;
          hideResult();

          try {
            await loadSeatingList();
            filterGuests(input.value);
          } catch (error) {
            console.error("Seating order load failed:", error);
            showMessage("Unable to load seating details right now.");
          }
        });

        input.addEventListener("keydown", (event) => {
          if (suggestions.hidden) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            updateHighlightedSuggestion(highlightedIndex + 1);
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            updateHighlightedSuggestion(highlightedIndex - 1);
          }

          if (event.key === "Enter" && highlightedIndex >= 0) {
            event.preventDefault();
            selectGuest(activeSuggestions[highlightedIndex]);
          }

          if (event.key === "Escape") {
            hideSuggestions();
          }
        });

        suggestions.addEventListener("mousedown", (event) => {
          const item = event.target.closest(".seatFinderSuggestion");
          if (!item || item.classList.contains("seatFinderSuggestion--empty"))
            return;

          event.preventDefault();

          const index = Number(item.getAttribute("data-seat-index"));
          selectGuest(activeSuggestions[index]);
        });

        form.addEventListener("submit", async (event) => {
          event.preventDefault();

          try {
            await loadSeatingList();

            const guest =
              selectedGuest &&
              normalize(selectedGuest.name) === normalize(input.value)
                ? selectedGuest
                : findGuestByInput();

            showSeatResult(guest);
          } catch (error) {
            console.error("Seating order search failed:", error);
            showMessage("Unable to load seating details right now.");
          }
        });

        document.addEventListener("click", (event) => {
          if (
            form.contains(event.target) ||
            suggestions.contains(event.target) ||
            result.contains(event.target)
          ) {
            return;
          }

          hideSuggestions();
        });
      }

      function initGalleryLightbox() {
        const lightbox = qs("#lightbox");
        const lightboxImg = qs("#lightboxImg");
        const lightboxClose = qs("#lightboxClose");
        if (!lightbox || !lightboxImg) return;

        const open = (src, alt) => {
          lightboxImg.src = src;
          lightboxImg.alt = alt || "Gallery photo";
          lightbox.classList.add("isOpen");
          lightbox.setAttribute("aria-hidden", "false");
          document.body.style.overflow = "hidden";
        };

        const close = () => {
          lightbox.classList.remove("isOpen");
          lightbox.setAttribute("aria-hidden", "true");
          lightboxImg.src = "";
          document.body.style.overflow = "";
        };

        qsa("#galleryGrid .gallery__item").forEach((btn) => {
          on(btn, "click", () => {
            const src = btn.getAttribute("data-src");
            const img = btn.querySelector("img");
            if (src) open(src, img ? img.alt : "");
          });
        });

        on(lightboxClose, "click", close);
        on(lightbox, "click", (e) => {
          if (e.target === lightbox) close();
        });

        on(window, "keydown", (e) => {
          if (e.key === "Escape") close();
        });
      }

      (function () {
        const headings = Array.from(document.querySelectorAll("h2"));
        if (!headings.length) return;

        headings.forEach((h) => h.classList.add("h2-reveal"));

        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                io.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.2,
            rootMargin: "0px 0px -10% 0px",
          },
        );

        headings.forEach((h) => io.observe(h));
      })();

      (function () {
        const cards = Array.from(document.querySelectorAll(".tlItem .tlCard"));
        if (!cards.length) return;

        if (!("IntersectionObserver" in window)) {
          cards.forEach((c) => c.classList.add("tlCard--visible"));
          return;
        }

        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("tlCard--visible");
                io.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.15,
            rootMargin: "0px 0px -12% 0px",
          },
        );

        cards.forEach((card) => io.observe(card));
      })();

      (function () {
        const root = document.getElementById("bgIcons");
        if (!root) return;

        const ICONS = {
          heart: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-7.2-4.4-9.6-8.6C.7 9.3 2.2 6.6 5 5.7c1.8-.6 3.6 0 4.8 1.4C11 5.7 12.9 5.1 14.7 5.7c2.8.9 4.3 3.6 2.6 6.7C19.2 16.6 12 21 12 21z"/>
          </svg>`,
          ring: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3c2.8 0 5 2.2 5 5 0 .7-.2 1.4-.4 2h-1.9c.4-.6.6-1.3.6-2 0-1.7-1.4-3.1-3.1-3.1S8.9 6.3 8.9 8c0 .7.2 1.4.6 2H7.6c-.3-.6-.4-1.3-.4-2 0-2.8 2.2-5 4.8-5z"/>
            <path d="M12 9c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8zm0 2.1c-3.2 0-5.9 2.6-5.9 5.9S8.8 22.9 12 22.9s5.9-2.6 5.9-5.9S15.2 11.1 12 11.1z"/>
          </svg>`,
          flower: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22c-1.4-2.2-2-4.2-2-6.2 0-2.2.8-3.8 2-5 1.2 1.2 2 2.8 2 5 0 2-.6 4-2 6.2z"/>
            <path d="M12 10.2c-2 0-3.7-1.6-3.7-3.7S10 2.8 12 2.8s3.7 1.6 3.7 3.7S14 10.2 12 10.2z"/>
            <path d="M5.1 14.5c-2-.3-3.4-2.1-3.1-4.1.3-2 2.1-3.4 4.1-3.1 2 .3 3.4 2.1 3.1 4.1-.3 2-2.1 3.4-4.1 3.1z"/>
            <path d="M18.9 14.5c-2 .3-3.8-1.1-4.1-3.1-.3-2 1.1-3.8 3.1-4.1 2-.3 3.8 1.1 4.1 3.1.3 2-1.1 3.8-3.1 4.1z"/>
          </svg>`,
          sparkle: `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l1.2 6.2L20 12l-6.8 3.8L12 22l-1.2-6.2L4 12l6.8-3.8L12 2z"/>
          </svg>`,
        };

        const iconKeys = Object.keys(ICONS);
        const isSmall = window.matchMedia("(max-width: 720px)").matches;
        const COUNT = isSmall ? 18 : 34;

        const icons = [];
        for (let i = 0; i < COUNT; i++) {
          const el = document.createElement("div");
          el.className = "bg-icon is-anim";

          const key = iconKeys[Math.floor(Math.random() * iconKeys.length)];
          el.innerHTML = ICONS[key];

          const size = rand(isSmall ? 18 : 22, isSmall ? 44 : 58);
          const x = rand(0, 100);
          const y = rand(0, 100);
          const rot = rand(-20, 20);
          const opacity = rand(0.35, 0.85);

          const dx = `${rand(-10, 10)}px`;
          const dy = `${rand(-12, 12)}px`;
          const t = `${rand(6, 12)}s`;

          el.style.setProperty("--s", `${size}px`);
          el.style.setProperty("--o", opacity.toFixed(2));
          el.style.setProperty("--r", `${rot}deg`);
          el.style.setProperty("--dx", dx);
          el.style.setProperty("--dy", dy);
          el.style.setProperty("--t", t);

          el.style.left = `${x}%`;
          el.style.top = `${y}%`;

          root.appendChild(el);
          icons.push(el);
        }

        let ticking = false;
        window.addEventListener(
          "scroll",
          () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
              const s = window.scrollY || 0;

              for (let i = 0; i < icons.length; i++) {
                const el = icons[i];
                const depth = (i % 6) + 1;
                const offset = (s / (120 * depth)) % 12;
                el.style.transform = `translate3d(0, ${offset}px, 0) rotate(var(--r))`;
              }

              ticking = false;
            });
          },
          { passive: true },
        );

        function rand(min, max) {
          return Math.random() * (max - min) + min;
        }
      })();

      const music = initBackgroundMusic();
      initEnvelopeIntro(music.tryStart);
      initNavMenu();
      // initCountdown();
      initScrollReveal();
      initTimelineProgress();
      initRsvpSubmission();
      initWordsCarousel();
      initSeatFinder();
      initGalleryLightbox();
    })();
  }, []);
}
