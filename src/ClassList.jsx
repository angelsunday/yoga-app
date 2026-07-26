import ClassCard from "./ClassCard";

// Renders the list of available classes.
// Dumb component: receives data and the booking handler via props.
function ClassList({ classes, loading, onBook }) {
  //Show message while classes are being fetched from supabase
  if (loading) return <p>Φόρτωση μαθημάτων...</p>;

  //Handle the case where the studio has no classes yet
  if (classes.length === 0)
    return (
      <div className="empty-state">
        <span className="emoji">🧘</span>
        Δεν υπάρχουν προγραμματισμένα μαθήματα αυτή τη στιγμή
      </div>
    );

  return (
    <div>
      {classes.map((c) => (
        <ClassCard
          key={c.id}
          name={c.name}
          startsAt={c.starts_at}
          duration={c.duration}
          spots={c.spots}
          onBook={() => onBook(c.id)}
        />
      ))}
    </div>
  );
}

export default ClassList;
