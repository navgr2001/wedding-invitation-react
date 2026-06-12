function SeatFinderSection({ seatFinder }) {
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
            />
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
