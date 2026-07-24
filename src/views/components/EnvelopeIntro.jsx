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
          <p className="inviteKicker">SAVE THE DATE</p>

          <h1 className="inviteNames">
            <span className="inviteNames__line">Shalom</span>

            <span className="inviteNames__amp">&amp;</span>

            <span className="inviteNames__line">Dewmini</span>
          </h1>

          <p className="inviteMeta">
            <span>10.12.2026</span>

            <span> MELODY BALLROOM </span>

            {/* <span className="inviteMeta__separator" aria-hidden="true">
              •
            </span> */}

            <span>HOTEL RAMRICH - JA ELA</span>
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
