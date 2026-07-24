import { useState, useEffect } from 'react'
import './App.css'
import ClassCard from './ClassCard'
import { supabase } from './supabaseClient'
import Auth from './Auth'

function App() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

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

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({ user_id: session.user.id, class_id: id })

    if (bookingError) {
      if (booking.Error.code === '23505') {
        alert('Έχετε ήδη κάνει κράτηση για αυτό το μάθημα.')
      } else {
        console.error('Σφάλμα κατά την κράτηση:', bookingError.message)
      }
      return
    }

    const newSpots = target.spots - 1

    const { error: spotsError } = await supabase
      .from('classes')
      .update({ spots: newSpots })
      .eq('id', id)

    if (spotsError) {
      console.error('Σφάλμα κατά την ενημέρωση των θέσεων:', spotsError.message)
      return
    }
    
    setClasses(
      classes.map((c) => (c.id === id ? { ...c, spots: newSpots } : c))
    )
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

    return (
      <div>
        <h1>Yoga Class Chania</h1>

        {!session ? (
          <Auth />
        ) : (
          <>

          <p>Συνδεδεμενος/η ως {session.user.email}{''}
          <button className="link-btn" onClick={handleSignOut}>Αποσύνδεση</button>
          </p>

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
        </>
        )}
      </div>
)
}

export default App