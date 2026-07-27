import { useState } from "react";

// TEACHER ONLY: form to open a new private lesson slot.
// Simpler than a class: just a date/time and a duration.
function NewSlotForm({ onCreate }) {
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!startsAt || !duration.trim()) {
      alert("Συμπλήρωσε ημερομηνία/ώρα και διάρκεια.");
      return;
    }

    setSaving(true);
    await onCreate({
      starts_at: startsAt,
      duration: Number(duration),
    });
    setSaving(false);

    //Clear the form
    setStartsAt("");
    setDuration("");
  }

  return (
    <div className="new-class">
      <h3>Άνοιγμα ελεύθερης ώρας (ιδιωτικό)</h3>

      <label className="filed-label">
        Ημερομηνία & Ώρα
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </label>

      <input
        type="number"
        placeholder="Διάρκεια σε λεπτά (π.χ. 60)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <button className="book-btn" onClick={handleSubmit} disabled={saving}>
        {saving ? "Αποθήκευση..." : "Άνοιγμα ώρας"}
      </button>
    </div>
  );
}

export default NewSlotForm;
