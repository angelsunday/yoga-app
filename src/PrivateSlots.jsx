import { formatDateTime } from "./format";

// CLIENT VIEW: list of private lesson slots the client can book.
// Shows open slots as bookable; the client's own booked slot shows a cancel option.
function PrivateSlots({ slots, userId, onBook, onCancel }) {
  // Only show slots that are open OR booked by this user
  const visible = slots.filter(
    (s) => s.status === "open" || s.booked_by === userId,
  );

  if (visible.length === 0) return null;

  return (
    <div className="dashboard">
      <h2>Ιδιωτικά μαθήματα</h2>

      {visible.map((s) => {
        const mine = s.booked_by === userId;
        return (
          <div key={s.id} className="booking-row">
            <span>
              {formatDateTime(s.starts_at)} · {s.duration} λεπτά
              {mine && (
                <span className="badge badge-low">Κλεισμένο από εσένα</span>
              )}
            </span>

            {mine ? (
              <button className="cancel-btn" onClick={() => onCancel(s.id)}>
                Ακύρωση
              </button>
            ) : (
              <button className="paid-btn paid" onClick={() => onBook(s.id)}>
                Κλείσε
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PrivateSlots;
