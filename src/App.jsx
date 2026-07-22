import './App.css'
import ClassCard from './ClassCard'

function App() {
  const classes = [
    { name: "Vinyasa Flow", time: "18:00 · 60 λεπτά" },
    { name: "Yin Yoga", time: "19:30 · 75 λεπτά" },
    { name: "Hatha Morning", time: "8:00 · 60 λεπτά" },
    { name: "Hatha Yoga", time: "21:00 · 60 λεπτά" },
  ]

  return (
    <div>
      <h1>Asana studio</h1>
      <p>Κλείσε το μάθημά σου εύκολα</p>
      {classes.map((c) => (
        <ClassCard key={c.id} name={c.name} time={c.time} />
      ))}
    </div>
  )
}

export default App