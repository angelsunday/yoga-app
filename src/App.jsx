import { useState, useEffect } from "react";
import "./App.css";
import ClassCard from "./ClassCard";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import MyBookings from "./MyBookings";

function App() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchClasses() {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("id");

      if (error) {
        console.error("Σφάλμα:", error.message);
      } else {
        setClasses(data);
      }
      setLoading(false);
    }

    fetchClasses();
  }, []);

  useEffect(() => {
    if (!session) {
      setMyBookings([]);
      return;
    }

    async function fetchMyBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, class_id, classes(name, time)")
        .order("created_at");

      if (error) {
        console.error("Σφάλμα:", error.message);
      } else {
        setMyBookings(data);
      }
    }
    fetchMyBookings();
  }, [
    session,
  ]); /*«τρέξε κάθε φορά που αλλάζει το session» — δηλαδή όταν συνδέεται ή αποσυνδέεται κάποιος. Λογικό: άλλος χρήστης, άλλες κρατήσεις.*/

  // Books a class for the logged-in user:
  // 1) inserts a booking row, 2) decreases the class spots,
  // 3) updates both lists on screen.
  async function handleBook(id) {
    const target = classes.find((c) => c.id === id);
    if (!target || target.spots <= 0) return;

    // Insert the booking AND ask supabase to return the new row
    // joined with its class data, so we can show it immediately
    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({ user_id: session.user.id, class_id: id })
      .select("id, class_id, classes(name, time)")
      .single();

    if (bookingError) {
      //23505 = Postgres "unique violation" -> user already booked this class
      if (bookingError.code === "23505") {
        alert("Έχετε ήδη κάνει κράτηση για αυτό το μάθημα.");
      } else {
        console.error("Σφάλμα κατά την κράτηση:", bookingError.message);
      }
      return;
    }

    // Decrease the class spots (-1)
    const newSpots = target.spots - 1;
    const { error: spotsError } = await supabase
      .from("classes")
      .update({ spots: newSpots })
      .eq("id", id);

    if (spotsError) {
      console.error(
        "Σφάλμα κατά την ενημέρωση των θέσεων:",
        spotsError.message,
      );
      return;
    }

    // Update the classes list on screen
    setClasses(
      classes.map((c) => (c.id === id ? { ...c, spots: newSpots } : c)),
    );

    //Add the new booking to "My bookings" (append to the array)
    setMyBookings([...myBookings, newBooking]);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  // Cancels a booking: deletes the booking row, gives the spot back
  // to the class, and removes it from the on-screen list.
  async function handleCancel(bookingId, classId) {
    // 1. Delete the booking row from the database
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Σφάλμα κατά την ακύρωση της κράτησης:", error.message);
      return; // stop here — don't touch the UI if the DB failed
    }

    // 2. Give the spot back to the class (+1)
    const target = classes.find((c) => c.id === classId);
    if (target) {
      const newSpots = target.spots + 1;
      await supabase
        .from("classes")
        .update({ spots: newSpots })
        .eq("id", classId);

      // Update the classes list on screen with the new spot count
      setClasses(
        classes.map((c) => (c.id === classId ? { ...c, spots: newSpots } : c)),
      );
    }

    // 3. Remove this booking from "My bookings" (filter = new list without it)
    setMyBookings(myBookings.filter((b) => b.id !== bookingId));
  }

  return (
    <div>
      <h1>Yoga Class Chania</h1>

      {!session ? (
        <Auth />
      ) : (
        <>
          <p>
            Συνδεδεμενος/η ως {session.user.email}
            {""}
            <button className="link-btn" onClick={handleSignOut}>
              Αποσύνδεση
            </button>
          </p>

          <MyBookings bookings={myBookings} onCancel={handleCancel} />

          {loading ? (
            <p>Φόρτωση μαθημάτων…</p>
          ) : (
            classes.map((c) => (
              <ClassCard
                key={c.id}
                name={c.name}
                time={c.time}
                spots={c.spots}
                onBook={() => handleBook(c.id)}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}

export default App;
