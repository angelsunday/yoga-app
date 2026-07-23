import { useState, useEffect } from 'react'
import './App.css'
import ClassCard from './ClassCard'
import { supabase } from './supabaseClient'

function App() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClasses() {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('id')

      if (error) {
        console.error('Σφάλμα:', error.message)
      } else {
        setClasses(data)
      }
      setLoading(false)
    }

    fetchClasses()
  }, [])

  async function handleBook(id) {
    const target = classes.find((c) => c.id === id)
    if (!target || target.spots <= 0) return

    const newSpots = target.spots -1

    const { error } = await supabase
      .from('classes')
      .update({ spots: newSpots })
      .eq('id', id)

      if (error) {
        console.error('Σφάλμα κατά την κράτηση:', error.message)
        return
      }
      setClasses(
        classes.map((c) => (c.id === id ? { ...c, spots: newSpots } : c))
      )
  }

  return (
    <div>
      <h1>Yoga Class Chania</h1>
      <p>Κλείσε το μάθημά σου με την Αγγελική.</p>

      {loading ? (
        <p>Φόρτωση μαθημάτων…</p>
      ) : (
        classes.map((c) => (
          <ClassCard
            key={c.id}
            name={c.name}
            time={c.time}
            spots={c.spots}
            onBook={() => handleBook(c.id)}
          />
        ))
      )}
    </div>
  )
}

export default App