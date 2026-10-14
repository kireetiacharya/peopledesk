import { useAuth } from '../AuthContext.jsx'

export default function Shell({ children, eyebrow, title }) {
  const { employee, logout } = useAuth()
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/dashboard" aria-label="PeopleDesk home">
          <span className="brand-mark">P</span>
          <span>PeopleDesk</span>
        </a>
        <div className="topbar-user">
          <div className="user-copy">
            <strong>{employee?.name}</strong>
            <span>{employee?.role === 'ADMIN' ? 'Administrator' : employee?.departmentName || 'Employee'}</span>
          </div>
          <button className="btn btn-outline-secondary btn-sm signout" onClick={logout}>Sign out</button>
        </div>
      </header>
      <main className="page-content">
        <div className="page-heading">
          <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
        </div>
        {children}
      </main>
      <footer className="app-footer">PeopleDesk <span>·</span> Employee Management System</footer>
    </div>
  )
}
