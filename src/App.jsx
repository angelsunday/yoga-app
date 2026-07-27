import { useState, useEffect } from "react";
import "./App.css";
import ClassCard from "./ClassCard";
import {
  fetchClasses,
  fetchMyBookings,
  createBooking,
  deleteBooking,
  updateClassSpots,
  fetchMyProfile,
  fetchAllBookings,
  createClass,
  deleteClass,
  fetchPrivateSlots,
  createPrivateSlot,
  deletePrivateSlot,
  bookPrivateSlot,
  cancelPrivateSlot,
} from "./api";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import MyBookings from "./MyBookings";
import ClassList from "./ClassList";
import TeacherDashboard from "./TeacherDashboard";
import NewClassForm from "./NewClassForm";
import Header from "./Header";
import NewSlotForm from "./NewSlotForm";
import PrivateSlots from "./PrivateSlots";

function App() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);

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

  //Load upcoming private slots once, when the app starts
  useEffect(() => {
    async function load() {
      const { data, error } = await fetchPrivateSlots();
      if (error) console.error("Σφάλμα slots: ", error.message);
      else setSlots(data);
    }
    load();
  }, []);

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

  //TEACHER ONLY: create a new class, then add it to the list on the screen
  async function handleCreateClass(newClass) {
    const { data, error } = await createClass(newClass);

    if (error) {
      console.error("Σφάλμα δημιουργίας: ", error.message);
      alert("Δεν ήταν δυνατή η δημιουργία του μαθήματος");
      return;
    }

    //Add the new class to the top of the list
    setClasses([...classes, data]);
  }
  // TEACHER ONLY: delete a class, with confirmation, then remove it on screen
  async function handleDeleteClass(classId) {
    //Ask before deleting-this action is permanents
    const ok = window.confirm("Σίγουρα θέλεις να διαγράψεις αυτό το μάθημα;");
    if (!ok) return;

    const { error } = await deleteClass(classId);
    if (error) {
      console.error("Σφάλμα διαγραφής:", error.message);
      alert("Δεν ήταν δυνατή η διαγραφή.");
      return;
    }
    //Remove it from list on screen
    setClasses(classes.filter((c) => c.id !== classId));
  }

  //TEACHER: open a new private slot
  async function handleCreateSlot(slot) {
    const { data, error } = await createPrivateSlot(slot);
    if (error) {
      console.error("Σφάλμα δημιουργίας ώρας: ", error.message);
      alert("Δεν ήταν δυνατό το άνοιγμα της ώρας.");
      return;
    }
    setSlots([...slots, data]);
  }

  //TEACHER: delete a private slot (with confirmation)
  async function handleDeleteSlot(slotId) {
    const ok = window.confirm("Σίγουρα θέλεις να διαγράψεις αυτή την ώρα;");
    if (!ok) return;

    const { error } = await deletePrivateSlot(slotId);
    if (error) {
      console.error("Σφάλμα διαγραφής ώρας: ", error.message);
      return;
    }
    setSlots(slots.filter((s) => s.id !== slotId));
  }

  //CLIENT: book an open private slot
  async function handleBookSlot(slotId) {
    const { data, error } = await bookPrivateSlot(slotId, session.user.id);
    if (error || !data) {
      alert("Αυτή η ώρα μόλις κλείστηκε από κάποιον άλλον.");
      return;
    }
    // Update the slot in local state
    setSlots(slots.map((s) => (s.id === slotId ? data : s)));
  }
  // CLIENT: cancel their private slot booking
  async function handleCancelSlot(slotId) {
    const { data, error } = await cancelPrivateSlot(slotId);
    if (error) {
      console.error("Σφάλμα ακύρωσης ώρας: ", error.message);
      return;
    }
    setSlots(slots.map((s) => (s.id === slotId ? data : s)));
  }

  return (
    <div>
      <Header session={session} profile={profile} onSignOut={handleSignOut} />

      {/* Not logged in -> show the sign in / sign up form */}
      {!session ? (
        <Auth />
      ) : profile?.role === "teacher" ? (
        /* Teacher view: create-class form + bookings dashboard */
        <>
          <NewClassForm onCreate={handleCreateClass} />
          <NewSlotForm onCreate={handleCreateSlot} />
          <TeacherDashboard
            classes={classes}
            onDeleteClass={handleDeleteClass}
            slots={slots}
            onDeleteSlot={handleDeleteSlot}
          />
        </>
      ) : (
        /* Client view: my bookings + class list */
        <>
          <MyBookings bookings={myBookings} onCancel={handleCancel} />
          <PrivateSlots
            slots={slots}
            userId={session.user.id}
            onBook={handleBookSlot}
            onCancel={handleCancelSlot}
          />
          <ClassList classes={classes} loading={loading} onBook={handleBook} />
        </>
      )}
    </div>
  );
}

export default App;
