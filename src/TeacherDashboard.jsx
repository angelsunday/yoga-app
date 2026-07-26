import { useState, useEffect } from "react";
import { fetchAllBookings } from "./api";
import { formatDateTime } from "./format";

// TEACHER VIEW: shows all bookings + the class schedule with delete buttons.
// Classes and the delete handler come from App via props.
function TeacherDashboard({ classes, onDeleteClass }) {
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

      {/* --- Card 2: all student bookings --- */}
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
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default TeacherDashboard;
