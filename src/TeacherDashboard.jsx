import { useState, useEffect } from "react";
import { fetchAllBookings, updateBookingPaid } from "./api";
import { formatDateTime } from "./format";

// TEACHER VIEW: shows all bookings + the class schedule with delete buttons.
// Classes and the delete handler come from App via props.
function TeacherDashboard({ classes, onDeleteClass, slots, onDeleteSlot }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchAllBookings();
      if (error) console.error("Σφάλμα: ", error.message);
      else setBookings(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Φόρτωση κρατήσεων...</p>;

  async function togglePaid(bookingId, currentPaid) {
    const { error } = await updateBookingPaid(bookingId, !currentPaid);
    if (error) {
      console.error("Σφάλμα πληρωμής: ", error.message);
      return;
    }
    //Update the local list so the change shows immediately
    setBookings(
      bookings.map((b) =>
        b.id === bookingId ? { ...b, paid: !currentPaid } : b,
      ),
    );
  }

  return (
    <>
      {/* --- Card 1: the teacher's class schedule --- */}
      <div className="dashboard">
        <h2>Τα μαθήματα μου</h2>

        {classes.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🧘</span>
            Δεν υπάρχουν προγραμματισμένα μαθήματα.
          </div>
        ) : (
          classes.map((c) => (
            <div key={c.id} className="booking-row">
              <span>
                <strong>{c.name}</strong> — {formatDateTime(c.starts_at)}
              </span>
              <button
                className="cancel-btn"
                onClick={() => onDeleteClass(c.id)}
              >
                Διαγραφή
              </button>
            </div>
          ))
        )}
      </div>

      {/* --- Card 2: private lesson slots --- */}
      <div className="dashboard">
        <h2>Ελεύθερες ώρες (ιδιωτικά)</h2>

        {slots.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🕐</span>
            Δεν έχεις ανοίξει ελεύθερες ώρες.
          </div>
        ) : (
          slots.map((s) => (
            <div key={s.id} className="booking-row">
              <span>
                {formatDateTime(s.starts_at)} · {s.duration} λεπτά
                {/* Show whether the slot is taken and by whom is added later */}
                {s.status === "booked" && (
                  <span className="badge badge-low">
                    {" "}
                    Κλεισμένο -{s.profiles?.full_name || "άγνωστος"}
                  </span>
                )}
              </span>
              <button className="cancel-btn" onClick={() => onDeleteSlot(s.id)}>
                Διαγραφή
              </button>
            </div>
          ))
        )}
      </div>

      {/* --- Card 3: all student bookings --- */}
      <div className="dashboard">
        <h2>Κρατήσεις Πελατών</h2>
        <p className="dash-count">Σύνολο κρατήσεων: {bookings.length}</p>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">📋</span>
            Δεν υπάρχουν κρατήσεις ακόμη.
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="booking-row">
              <span>
                <strong>{b.classes.name}</strong> —{" "}
                {formatDateTime(b.classes.starts_at)}
              </span>
              <span className="student">
                {b.profiles?.full_name || "Χωρίς Όνομα"}
              </span>
              <button
                className={b.paid ? "paid-btn paid" : "paid-btn"}
                onClick={() => togglePaid(b.id, b.paid)}
              >
                {b.paid ? "✓ Πληρωμένο" : "Απλήρωτο"}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default TeacherDashboard;
