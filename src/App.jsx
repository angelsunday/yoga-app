import './App.css'
import ClassCard from './ClassCard'

function App() {
  const classes = [
    { id: 1, name: "Vinyasa 1-2", time: "09:00 · 90 λεπτά", spots: 6 },
    { id: 2, name: "Wall  Yoga (Iyengar)", time: "16:45 · 90 λεπτά", spots: 3 },
    { id: 3, name: "Vinyasa 3", time: "18:30 · 90 λεπτά", spots: 8  },
    { id: 4, name: "Meditation", time: "0:00 · 45 λεπτά", spots: 10 },
  ]

  return (
    <div>
      <h1>Yoga Class Chania</h1>
      <p>Κλείσε το μάθημά σου με την Αγγελική</p>
      {classes.map((c) => (
        <ClassCard key={c.id} name={c.name} time={c.time} spots={c.spots} />
      ))}
    </div>
  )
}

export default App