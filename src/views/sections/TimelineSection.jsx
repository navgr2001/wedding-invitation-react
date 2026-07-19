function TimelineSection({ timeline }) {
  return (
    <section id="timeline" className="section">
      <div className="timelineWrapV2">
        <h2 className="timelineTitleV2">{timeline.title}</h2>
        <div className="timelineV2" id="timelineV2">
          <ul className="tlList" id="tlList">
            {timeline.items.map((item) => (
              <TimelineItem key={`${item.time}-${item.text}`} item={item} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ item }) {
  const card = (
    <div className="tlCard">
      <div className="tlTime">{item.time}</div>
      <div className="tlText">{item.text}</div>
    </div>
  );

  const node = (
    <div className="tlNode" aria-hidden="true">
      <span className="timeline-icon" aria-label={item.iconLabel}>
        <img src={item.icon} alt={item.iconAlt} loading="lazy" decoding="async" />
      </span>
    </div>
  );

  return (
    <li className={`tlItem tlItem--${item.side}`}>
      {item.side === "left" ? (
        <>
          {card}
          {node}
          <div></div>
        </>
      ) : (
        <>
          <div></div>
          {node}
          {card}
        </>
      )}
    </li>
  );
}

export default TimelineSection;
