import { useState } from 'react'
import { supabase } from './supabaseClient'

function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    async function handleSignUp() {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
            setMessage('Σφάλμα: ' + error.message)
        } else {
            setMessage('Επιτυχής εγγραφή!')
        }
    }

    async function handleSignIn() {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setMessage('Σφάλμα: ' + error.message)}
    }

    return (
        <div className="auth-box">
            <h2>Σύνδεση</h2>

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
            <button className="book-btn" onClick={handleSignIn}>Σύνδεση</button>
            <button className="link-btn" onClick={handleSignUp}>Δεν έχω λογαριασμό - Εγγραφή</button>

            {message && <p className="auth-msg">{message}</p>}
        </div>
    )
}
export default Auth