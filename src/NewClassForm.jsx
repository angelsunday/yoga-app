import { useState } from "react";

// TEACHER ONLY: form to create a new class.
// Dumb-ish component: it manages its own input state, but the actual
// database insert is passed in from App via the onCreate prop.

function NewClassForm({ onCreate }) {
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState("");
  const [spots, setSpots] = useState(10);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    //Basic validation: dont allow empty fields
    if (!name.trim() || !startsAt || !duration.trim()) {
      alert("Συμπλήρωσε όνομα, ώρα και διάρκεια.");
      return;
    }

    setSaving(true); // We send starts_at (real timestamp) and duration separately now
    await onCreate({
      name: name.trim(),
      starts_at: startsAt,
      duration: Number(duration),
      spots,
    });
    setSaving(false);

    //Clear the form after succesfull create
    setName("");
    setStartsAt("");
    setDuration("");
    setSpots(10);
  }

  return (
    <div className="new-class">
      <h3>Νέο Μάθημα</h3>

      <input
        type="text"
        placeholder="Όνομα (π.χ. Vinyasa 2)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="field-label">
        Ημερομηνία & Ώρα
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </label>

      <label className="field-label">
        Διάρκεια
        <input
          type="number"
          placeholder="Διάρκεια σε λεπτά (π.χ 90)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </label>

      <label className="spots-label">
        Θέσεις: {spots}
        <input
          type="range"
          min="1"
          max="30"
          value={spots}
          onChange={(e) => setSpots(Number(e.target.value))}
        />
      </label>

      <button className="book-btn" onClick={handleSubmit} disabled={saving}>
        {saving ? "Αποθήκευση..." : "Δημιουργία μαθήματος"}
      </button>
    </div>
  );
}

export default NewClassForm;
