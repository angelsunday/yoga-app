import { useState, useEffect } from "react";
import "./App.css";
import ClassCard from "./ClassCard";
import {
  fetchClasses,
  fetchMyBookings,
  createBooking,
  deleteBooking,
  updateClassSpots,
} from "./api";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import MyBookings from "./MyBookings";
import ClassList from "./ClassList";
import { fetchMyProfile } from "./api";
import TeacherDashboard from "./TeacherDashboard";

function App() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [profile, setProfile] = useState(null);

  //--Auth: read the session once, then listen for login/logout
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession),
    );

    //Cleanup: Stop listening when the component unmounts
    return () => listener.subscription.unsubscribe();
  }, []);

  //--Load the class schedule once, when the app starts--
  useEffect(() => {
    async function load() {
      const { data, error } = await fetchClasses();
      if (error) console.error("Σφάλμα φόρτωσης:", error.message);
      else setClasses(data);
      setLoading(false);
    }
    load();
  }, []);

  //--Load the user's bookings; re-runs whenever the session changes--
  useEffect(() => {
    if (!session) {
      setMyBookings([]);
      return;
    }

    async function load() {
      const { data, error } = await fetchMyBookings();
      if (error) console.error("Σφάλμα κρατήσεων: ", error.message);
      else setMyBookings(data);
    }
    load();
  }, [
    session,
  ]); /*«τρέξε κάθε φορά που αλλάζει το session» — δηλαδή όταν συνδέεται ή αποσυνδέεται κάποιος. Λογικό: άλλος χρήστης, άλλες κρατήσεις.*/

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }

    async function load() {
      const { data, error } = await fetchMyProfile(session.user.id);
      if (error) console.error("Σφάλμα προφιλ: ", error.message);
      else setProfile(data);
    }
    load();
  }, [session]);

  // --- Book a class: save to DB first, then update the screen ---
  async function handleBook(id) {
    const target = classes.find((c) => c.id === id);
    if (!target || target.spots <= 0) return;

    const { data: newBooking, error } = await createBooking(
      session.user.id,
      id,
    );

    if (error) {
      //23505 = Postgres unique violation -> already booked
      if (error.code === "23505") alert("Έχεις ήδη κλείσει αυτό το μάθημα.");
      else console.error("Σφάλμα κράτησης: ", error.message);
      return;
    }

    const newSpots = target.spots - 1;
    await updateClassSpots(id, newSpots);

    setClasses(
      classes.map((c) => (c.id === id ? { ...c, spots: newSpots } : c)),
    );
    setMyBookings([...myBookings, newBooking]);
  }

  //--Cancel a booking: delete it then give the spot back--
  async function handleCancel(bookingId, classId) {
    const { error } = await deleteBooking(bookingId);
    if (error) {
      console.error("Σφάλμα ακύρωσης: ", error.message);
      return;
    }

    const target = classes.find((c) => c.id === classId);
    if (target) {
      const newSpots = target.spots + 1;
      await updateClassSpots(classId, newSpots);
      setClasses(
        classes.map((c) => (c.id === classId ? { ...c, spots: newSpots } : c)),
      );
    }

    setMyBookings(myBookings.filter((b) => b.id !== bookingId));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <h1>Yoga Class Chania</h1>
      {/* Not logged in -> show the sign in / sign up form */}
      {!session ? (
        <Auth />
      ) : (
        <>
          <p>
            Συνδεδεμενος/η ως {session.user.email}
            {profile?.role === "teacher" && " (δασκάλα)"}{" "}
            <button className="link-btn" onClick={handleSignOut}>
              Αποσύνδεση
            </button>
          </p>

          {/* Teachers see the dashboard; clients see the booking view.
              Note: this only hides the UI — the real rule is enforced
              by the RLS policy on the bookings table. */}
          {profile?.role === "teacher" ? (
            <TeacherDashboard />
          ) : (
            <>
              <MyBookings bookings={myBookings} onCancel={handleCancel} />

              <ClassList
                classes={classes}
                loading={loading}
                onBook={handleBook}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
