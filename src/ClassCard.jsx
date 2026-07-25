import { formatDateTime } from "./format";

// A single class card. shows name, date/time, duration, spots, and a book button
function ClassCard({ name, startsAt, duration, spots, onBook }) {
  const isLow = spots <= 3;
  const isFull = spots === 0;

  return (
    <div className="card">
      <div className="card-top">
        <h3 className="card-name">{name}</h3>
        <span className={isLow ? "badge badge-low" : "badge"}>
          {isFull ? "Γεμάτο" : `${spots} θέσεις`}
        </span>
      </div>
      {/*formatDateTime turns the timestamp into "Τρι 28 Ιουλ, 18:30" */}
      <p className="card-meta">
        {formatDateTime(startsAt)} · {duration} λεπτά
      </p>
      <button className="book-btn" onClick={onBook} disabled={isFull}>
        {isFull ? "Δεν υπάρχουν θέσεις" : "Κράτηση"}
      </button>
    </div>
  );
}

export default ClassCard;
