import { useState, useEffect } from "react";
import { fetchAllBookings } from "./api";

// TEACHER VIEW: shows every booking made by every student.
// Only rendered when the logged-in user has role 'teacher'.
function TeacherDashboard() {
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
    <div className="dashboard">
      <h2>Πίνακας Δασκάλας</h2>
      <p className="dash-count">Σύνολο κρατήσεων: {bookings.length}</p>

      {bookings.length === 0 ? (
        <p>Δεν υπάρχουν κρατήσεις ακόμη.</p>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="booking-row">
            <span>
              <strong>{b.classes.name}</strong> - {b.classes.time}
            </span>
            <span className="student">
              {b.profiles?.full_name || "Χωρίς Όνομα"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default TeacherDashboard;
