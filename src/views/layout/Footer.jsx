import { PhoneIcon } from "../components/IconSvgs";

function Footer({ footer }) {
  return (
    <footer className="weddingFooter" id="contact">
      <div className="weddingFooter__container">
        <div className="weddingFooter__grid">
          <div className="weddingFooter__brand">
            <div className="weddingFooter__logo">
              <span className="weddingFooter__logoIcon" aria-hidden="true">
                <img
                  src={footer.logoIcon}
                  alt=""
                  className="weddingFooter__logoImage"
                />
              </span>

              <span className="weddingFooter__logoText">{footer.logoText}</span>
            </div>

            <p className="weddingFooter__description">{footer.description}</p>
          </div>

          <div className="weddingFooter__column">
            <h3 className="weddingFooter__title">Quick Links</h3>

            <nav
              className="weddingFooter__links"
              aria-label="Footer quick links"
            >
              <a href="/details">Details</a>
              <a href="/rsvp">Rsvp</a>
              <a href="/gallery">Gallery</a>
            </nav>
          </div>

          <div className="weddingFooter__column">
            <h3 className="weddingFooter__title">Wedding Details</h3>

            <div className="weddingFooter__details">
              {footer.details.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="weddingFooter__column weddingFooter__column--contact">
            <h3 className="weddingFooter__title">Contact</h3>

            <div className="weddingFooter__contact">
              {footer.contacts.map((contact) => (
                <a
                  className="weddingFooter__contactItem"
                  href={`tel:${contact.phone}`}
                  key={contact.name}
                >
                  <span
                    className="weddingFooter__contactIcon"
                    aria-hidden="true"
                  >
                    <PhoneIcon />
                  </span>

                  <span className="weddingFooter__contactText">
                    {contact.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="weddingFooter__bottom">
          <p className="weddingFooter__love">Made with love</p>
          <p className="weddingFooter__copy">
            © 2026 Shalom &amp; Dewmini&apos;s Wedding
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
