import { useState } from "react";

function SeatFinderSection({ seatFinder }) {
  const [hasName, setHasName] = useState(false);

  const clearName = () => {
    const input = document.getElementById("seatGuestName");

    if (!input) return;

    // Clear the entered guest name
    input.value = "";
    setHasName(false);

    // Notify the existing search logic so that
    // selected guests, suggestions and results reset.
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // Allow the guest to enter another name
    input.focus();
  };

  return (
    <section className="section seatFinderSection" id="seatFinder">
      <div className="container seatFinderContainer">
        <div className="seatFinderCard reveal">
          <div className="seatFinderIcon" aria-hidden="true">
            <img src={seatFinder.icon} alt="" />
          </div>

          <h2 className="seatFinderTitle">{seatFinder.title}</h2>

          <p className="seatFinderText">{seatFinder.text}</p>

          <form
            className="seatFinderForm"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="srOnly" htmlFor="seatGuestName">
              Enter your name
            </label>

            <input
              id="seatGuestName"
              className="seatFinderInput"
              type="text"
              placeholder="Enter your name..."
              autoComplete="name"
              onInput={(event) =>
                setHasName(Boolean(event.currentTarget.value))
              }
            />

            {/* Clear name button */}
            {hasName && (
              <button
                type="button"
                onClick={clearName}
                aria-label="Clear name and search again"
                title="Clear name"
                style={{
                  flex: "0 0 auto",
                  border: 0,
                  background: "transparent",
                  color: "#6b7280",
                  font: "inherit",
                  fontSize: "24px",
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: "8px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                &times;
              </button>
            )}

            {/* Existing search button */}
            <button
              className="seatFinderButton"
              type="submit"
              aria-label="Search your seat"
            >
              <img src={seatFinder.searchIcon} alt="" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SeatFinderSection;
