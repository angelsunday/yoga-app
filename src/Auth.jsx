import { useState } from "react";
import { supabase } from "./supabaseClient";

// Sign in / sign up form.
// On sign up we also send the user's name as metadata,
// which the database trigger copies into the profiles table.
function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignUp() {
    // Name is required so the teacher can see who booked
    if (!fullName.trim()) {
      setMessage("Συμπλήρωσε το όνομα σου.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() }, // -> raw_user_meta_data
      },
    });

    if (error) setMessage("Σφάλμα: " + error.message);
    else setMessage("Ο λογαριασμός δημιοθργήθηκε! Μπορεις να συνδεθείς.");
  }

  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage("Σφάλμα: " + error.message);
    }
  }

  return (
    <div className="auth-box">
      <h2>Σύνδεση / Εγγραφή</h2>

      <input
        type="text"
        placeholder="Ονοματεπώνυμο (για εγγραφή)"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Κωδικός"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="book-btn" onClick={handleSignIn}>
        Σύνδεση
      </button>

      <button className="link-btn" onClick={handleSignUp}>
        Δεν έχω λογαριασμό - Εγγραφή
      </button>

      {message && <p className="auth-msg">{message}</p>}
    </div>
  );
}
export default Auth;
