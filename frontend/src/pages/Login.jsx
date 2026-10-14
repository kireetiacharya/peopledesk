import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { errorMessage } from '../api.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <a className="brand login-brand" href="/login"><span className="brand-mark">P</span><span>PeopleDesk</span></a>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Sign in to your account</h1>
        <p className="muted">Access your team workspace and employee profile.</p>
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <label className="form-label" htmlFor="email">Work email</label>
          <input id="email" className="form-control mb-3" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" className="form-control mb-4" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="btn btn-primary w-100 py-2" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
      <p className="login-note">Secure access for your organization</p>
    </main>
  )
}
