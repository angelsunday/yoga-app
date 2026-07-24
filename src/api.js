import { supabase } from "./supabaseClient";

// ---------------------------------------------------------------
// All database calls live here, so components stay focused on UI.
// Every function returns { data, error } — the Supabase convention.
// ---------------------------------------------------------------

// Fetch all classes, ordered by id
export function fetchClasses() {
  return supabase.from("classes").select("*").order("id");
}

// Fetch the logged-in user's bookings, joined with their class info.
// No user filter needed: the RLS policy only returns the user's own rows.
export function fetchMyBookings() {
  return supabase
    .from("bookings")
    .select("id, class_id, classes(name, time)")
    .order("created_at");
}

// Create a booking and return the new row (joined with class info),
// so the UI can display it without re-fetching everything.
export function createBooking(userId, classId) {
  return supabase
    .from("bookings")
    .insert({ user_id: userId, class_id: classId })
    .select("id, class_id, classes(name, time)")
    .single();
}

// Delete a booking by its id
export function deleteBooking(bookingId) {
  return supabase.from("bookings").delete().eq("id", bookingId);
}

// Update the number of available spots for a class
export function updateClassSpots(classId, spots) {
  return supabase.from("classes").update({ spots }).eq("id", classId);
}

//Fetch the profile of the logged-in user (RLS returns only their own row)
export function fetchMyProfile(userId) {
  return supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();
}

// TEACHER ONLY: fetch every booking with class info and student profile.
// Works only for teachers thanks to the RLS policy above.q
export function fetchAllBookings() {
  return supabase
    .from("bookings")
    .select("id, created_at, classes(name,time), profiles(full_name")
    .order("created_at", { ascending: false });
}
