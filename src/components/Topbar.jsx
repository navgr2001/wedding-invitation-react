function Topbar() {
  return (
    <header className="topbar" id="topbar">

<button aria-controls="nav" aria-expanded="false" aria-label="Open menu" className="navToggle" id="navToggle">
<span></span><span></span><span></span>
</button>
<nav aria-label="Primary" className="nav" id="nav">
<a href="#details">Details</a>
<a href="#rsvp">RSVP</a>
<a href="#gallery">Gallery</a>
</nav>
</header>
  );
}

export default Topbar;
