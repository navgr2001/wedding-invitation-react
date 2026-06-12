import { HeartIcon } from "../components/IconSvgs";

function RsvpSection({ rsvp }) {
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
              <img src={rsvp.photo} alt="Couple photo" />
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
              <label className="fLabel">
                Name
                <input
                  className="fInput"
                  type="text"
                  name="name"
                  placeholder="Eg: Namal Perera"
                  required
                />
              </label>
              <div className="rsvpTwoCols">
                <label className="fLabel">
                  Will you attend?
                  <select className="fInput" name="attendance" required>
                    <option value="">Select</option>
                    <option value="Yes, I'll be there">Yes, I'll be there</option>
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
                    max="20"
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
                ></textarea>
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
