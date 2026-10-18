function EnvelopeIntro() {
  return (
    <div
      aria-label="Open wedding invitation"
      aria-modal="true"
      className="envelopeIntro inviteIntro"
      id="envelopeIntro"
      role="dialog"
    >
      <div className="inviteScene" role="document">
        <div className="inviteScene__artwork" aria-hidden="true" />

        <div className="inviteScene__shade" aria-hidden="true" />

        <div
          className="
            inviteScene__motion
            inviteScene__motion--topLeaves
          "
          aria-hidden="true"
        />

        <div
          className="
            inviteScene__motion
            inviteScene__motion--leftBranches
          "
          aria-hidden="true"
        />

        <div
          className="
            inviteScene__motion
            inviteScene__motion--rightFlowers
          "
          aria-hidden="true"
        />

        <main className="inviteContent">
          <p className="inviteKicker" aria-label="Save the date">
            <span className="inviteKicker__curve" aria-hidden="true">
              <span className="inviteKicker__letter">S</span>
              <span className="inviteKicker__letter">A</span>
              <span className="inviteKicker__letter">V</span>
              <span className="inviteKicker__letter">E</span>
              <span className="inviteKicker__space" />
              <span className="inviteKicker__letter">T</span>
              <span className="inviteKicker__letter">H</span>
              <span className="inviteKicker__letter">E</span>
              <span className="inviteKicker__space" />
              <span className="inviteKicker__letter">D</span>
              <span className="inviteKicker__letter">A</span>
              <span className="inviteKicker__letter">T</span>
              <span className="inviteKicker__letter">E</span>
            </span>
          </p>

          <h1 className="inviteNames">
            <span className="inviteNames__line inviteNames__line--first">
              Shalom <span className="inviteNames__amp">&amp;</span>
            </span>

            <span className="inviteNames__line inviteNames__line--second">
              Dewmini
            </span>
          </h1>

          <p className="inviteMeta">
            <span className="inviteMeta__date">10.12.2026</span>

            {/* <span> MELODY BALLROOM </span>

            <span>HOTEL RAMRICH - JA ELA</span> */}
          </p>

          <button
            className="inviteBtn"
            id="waxBtn"
            type="button"
            aria-label="View wedding invitation"
          >
            VIEW INVITATION
          </button>
        </main>
      </div>
    </div>
  );
}

export default EnvelopeIntro;
