import './App.css'
import ClassCard from './ClassCard'
import { useState } from 'react'

function App() {
  const [classes, setClasses]  = useState( [
    { id: 1, name: "Vinyasa 1-2", time: "09:00 · 90 λεπτά", spots: 6 },
    { id: 2, name: "Wall  Yoga (Iyengar)", time: "16:45 · 90 λεπτά", spots: 3 },
    { id: 3, name: "Vinyasa 3", time: "18:30 · 90 λεπτά", spots: 2  },
    { id: 4, name: "Meditation", time: "0:00 · 45 λεπτά", spots: 10 },
  ])

  function handleBook(id) {
    setClasses(
      classes.map((c) => c.id === id && c.spots > 0 ? { ...c, spots: c.spots - 1 } : c)
    )
  }

  return (
    <div>
      <h1>Yoga Class Chania</h1>
      <p>Κλείσε το μάθημά σου με την Αγγελική</p>
      {classes.map((c) => (
        <ClassCard 
        key={c.id}
        name={c.name}
        time={c.time}
        spots={c.spots}
        onBook={() => handleBook(c.id)}/>
      ))}
    </div>
  )
}

export default App