import { supabase } from "./supabaseClient";

// ---------------------------------------------------------------
// All database calls live here, so components stay focused on UI.
// Every function returns { data, error } — the Supabase convention.
// ---------------------------------------------------------------

// Fetch upcoming classes only (starts_at in the future), soonest first
export function fetchClasses() {
  return supabase
    .from("classes")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");
}

// Fetch the logged-in user's bookings, joined with their class info.
// No user filter needed: the RLS policy only returns the user's own rows.
export function fetchMyBookings() {
  return supabase
    .from("bookings")
    .select("id, class_id, classes(name, starts_at, duration)")
    .order("created_at");
}

// Create a booking and return the new row (joined with class info),
// so the UI can display it without re-fetching everything.
export function createBooking(userId, classId) {
  return supabase
    .from("bookings")
    .insert({ user_id: userId, class_id: classId })
    .select("id, class_id, classes(name, starts_at, duration)")
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
// Works only for teachers thanks to the RLS policy above.
export function fetchAllBookings() {
  return supabase
    .from("bookings")
    .select("id, created_at,paid, classes(name,starts_at), profiles(full_name)")
    .order("created_at", { ascending: false });
}

// Create a new class (now includes starts_at and duration)
export function createClass(newClass) {
  return supabase.from("classes").insert(newClass).select().single();
}

// TEACHER ONLY: delete a class by its id
export function deleteClass(classId) {
  return supabase.from("classes").delete().eq("id", classId);
}

// TEACHER ONLY: mark a booking as paid or unpaid
export function updateBookingPaid(bookingId, paid) {
  return supabase.from("bookings").update({ paid }).eq("id", bookingId);
}

// --- Private slots ---

// Fetch upcoming private slots (future only), soonest first
export function fetchPrivateSlots() {
  return supabase
    .from("private_slots")
    .select("id, starts_at, duration, status, booked_by, profiles(full_name)")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");
}

//TEACHER ONLY: open a new private slot
export function createPrivateSlot(slot) {
  return supabase.from("private_slots").insert(slot).select().single();
}

//TEACHER ONLY: delete a private slot
export function deletePrivateSlot(slotId) {
  return supabase.from("private_slots").delete().eq("id", slotId);
}

// CLIENT: book an open slot — set status to 'booked' and record who booked it.
// The .eq('status','open') guard prevents booking a slot someone just took.

export function bookPrivateSlot(slotId, userId) {
  return supabase
    .from("private_slots")
    .update({ status: "booked", booked_by: userId })
    .eq("id", slotId)
    .eq("status", "open")
    .select()
    .single();
}

//CLIENT: cancel their own slot booking - set it back to 'open'
export function cancelPrivateSlot(slotId) {
  return supabase
    .from("private_slots")
    .update({ status: "open", booked_by: null })
    .eq("id", slotId)
    .select()
    .single();
}
