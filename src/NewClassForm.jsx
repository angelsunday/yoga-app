import { useState } from "react";

// TEACHER ONLY: form to create a new class.
// Dumb-ish component: it manages its own input state, but the actual
// database insert is passed in from App via the onCreate prop.

function NewClassForm({ onCreate }) {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [spots, setSposts] = useState(10);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    //Basic validation: dont allow empty fields
    if (!name.trim() || !startTime.trim() || !duration.trim()) {
      alert("Συμπλήρωσε όνομα, ώρα και διάρκεια.");
      return;
    }

    //Build the display string ourselves, so the teacher never types symbols
    const time = `${startTime.trim()} · ${duration.trim()} λεπτά`;

    setSaving(true); //Disable the button while saving
    await onCreate({ name: name.trim(), time, spots });
    setSaving(false);

    //Clear the form after succesfull create
    setName("");
    setStartTime("");
    setDuration("");
    setSposts(10);
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

      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />

      <input
        type="number"
        placeholder="Διάρκεια σε λεπτά (π.χ 90)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <label className="spots-label">
        Θέσεις: {spots}
        <input
          type="range"
          min="1"
          max="30"
          value={spots}
          onChange={(e) => setSposts(Number(e.target.value))}
        />
      </label>

      <button className="book-btn" onClick={handleSubmit} disabled={saving}>
        {saving ? "Αποθήκευση..." : "Δημιουργία μαθήματος"}
      </button>
    </div>
  );
}

export default NewClassForm;
