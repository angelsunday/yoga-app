// Displays the list of bookings made by the logged-in user.
// This component is "dumb": it knows nothing about the database.
// It receives the bookings array and a cancel function via props.

function MyBookings({ bookings, onCancel }) {
  // Don't render anything if the user has no bookings
  if (bookings.length === 0) return null;

  return (
    <div className="my-bookings">
      <h2>Οι κρατήσεις μου</h2>

      {bookings.map((b) => (
        // b.classes.name / b.classes.time come from the join in the select()
        <div key={b.id} className="booking-row">
          <span>
            <strong>{b.classes.name}</strong> - {b.classes.time}
          </span>
          <button
            className="cancel-btn"
            onClick={() => onCancel(b.id, b.class_id)}
          >
            Ακύρωση
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyBookings;
