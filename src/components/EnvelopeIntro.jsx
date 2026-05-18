function EnvelopeIntro() {
  return (
    <div
      aria-label="Open invitation"
      aria-modal="true"
      className="envelopeIntro inviteIntro"
      id="envelopeIntro"
      role="dialog"
    >
      <div
        aria-hidden="true"
        className="envelopeIntro__scrim inviteIntro__scrim"
      ></div>
      <div className="inviteStage" aria-hidden="false">
        <div className="inviteCard" role="document">
          <div className="invitePaper" aria-hidden="true"></div>
          <div
            className="inviteFloral inviteFloralTop"
            aria-hidden="true"
          ></div>
          <div
            className="inviteFloral inviteFloralBottom"
            aria-hidden="true"
          ></div>

          <div className="inviteContent">
            <div className="inviteKicker">SAVE THE DATE</div>
            <div className="inviteNames">
              Dewmini <span className="inviteAmp">&amp;</span> Naveen
            </div>
            <div className="inviteMeta">
              10.12.2026 • HOTEL RAMRICH - JA ELA
            </div>
            <button
              className="inviteBtn"
              id="waxBtn"
              type="button"
              aria-label="View invitation"
            >
              VIEW INVITATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvelopeIntro;
