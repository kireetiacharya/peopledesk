import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import Shell from '../components/Shell.jsx'

export default function EmployeeDashboard() {
  const { updateEmployee } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [notice, setNotice] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/employees/me')
      .then(({ data }) => { setProfile(data); setForm({ name: data.name, email: data.email, phone: data.phone || '', address: data.address || '' }) })
      .catch((error) => setLoadError(errorMessage(error)))
  }, [])

  function notify(message, type = 'success') {
    setNotice({ message, type })
    window.setTimeout(() => setNotice(null), 3500)
  }

  async function saveProfile(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/employees/me', form)
      setProfile(data)
      updateEmployee(data)
      notify('Your profile has been updated.')
    } catch (error) {
      notify(errorMessage(error), 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(event) {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify('The new passwords do not match.', 'danger')
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      notify('Your password has been changed.')
    } catch (error) {
      notify(errorMessage(error), 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Shell eyebrow="MY WORKSPACE" title="My profile">
      {notice && <div className={`alert alert-${notice.type} py-2`} role="status">{notice.message}</div>}
      {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}
      {profile && <div className="employee-layout">
        <section className="profile-summary content-card">
          <div className="profile-avatar">{profile.name.slice(0, 1).toUpperCase()}</div>
          <h2>{profile.name}</h2><p>{profile.email}</p>
          <span className="status-pill status-active">Active</span>
          <div className="summary-divider" />
          <dl><dt>Department</dt><dd>{profile.departmentName || 'Not assigned'}</dd><dt>Employee since</dt><dd>{new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</dd></dl>
        </section>
        <div className="profile-panels">
          <section className="content-card profile-form-card"><div className="card-heading"><div><h2>Personal details</h2><p>Keep your contact information up to date.</p></div></div>
            <form onSubmit={saveProfile}><div className="form-grid">
              <div><label className="form-label" htmlFor="profile-name">Full name</label><input id="profile-name" className="form-control" required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
              <div><label className="form-label" htmlFor="profile-email">Work email</label><input id="profile-email" className="form-control" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
              <div><label className="form-label" htmlFor="profile-phone">Phone</label><input id="profile-phone" className="form-control" maxLength="30" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
              <div><label className="form-label" htmlFor="profile-address">Address</label><input id="profile-address" className="form-control" maxLength="255" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div>
            </div><div className="form-submit"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div></form>
          </section>
          <section className="content-card profile-form-card"><div className="card-heading"><div><h2>Change password</h2><p>Choose a strong password with at least 8 characters.</p></div></div>
            <form onSubmit={changePassword}><div className="form-grid">
              <div className="field-span"><label className="form-label" htmlFor="current-password">Current password</label><input id="current-password" className="form-control" type="password" required autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></div>
              <div><label className="form-label" htmlFor="new-password">New password</label><input id="new-password" className="form-control" type="password" minLength="8" maxLength="72" required autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></div>
              <div><label className="form-label" htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" className="form-control" type="password" minLength="8" maxLength="72" required autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></div>
            </div><div className="form-submit"><button className="btn btn-outline-primary" disabled={saving}>Update password</button></div></form>
          </section>
        </div>
      </div>}
    </Shell>
  )
}
