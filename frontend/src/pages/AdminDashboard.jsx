import { useEffect, useMemo, useState } from 'react'
import api, { errorMessage } from '../api.js'
import Shell from '../components/Shell.jsx'

const blankEmployee = { name: '', email: '', phone: '', address: '', departmentId: '', password: '' }
const blankDepartment = { name: '', description: '' }

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('employees')
  const [employeeForm, setEmployeeForm] = useState(null)
  const [departmentForm, setDepartmentForm] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState('')

  async function loadData() {
    try {
      const [employeeResponse, departmentResponse] = await Promise.all([
        api.get('/employees', { params: { search } }),
        api.get('/departments'),
      ])
      setEmployees(employeeResponse.data)
      setDepartments(departmentResponse.data)
      setLoadError('')
    } catch (error) {
      setLoadError(errorMessage(error))
    }
  }

  useEffect(() => { loadData() }, [search])
  const activeCount = useMemo(() => employees.filter((item) => item.active).length, [employees])

  function notify(message, type = 'success') {
    setNotice({ message, type })
    window.setTimeout(() => setNotice(null), 3500)
  }

  async function saveEmployee(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const body = { ...employeeForm, departmentId: employeeForm.departmentId || null }
      if (!employeeForm.id && !body.password) throw new Error('Set a temporary password for this employee.')
      if (employeeForm.id && !body.password) delete body.password
      if (employeeForm.id) await api.put(`/employees/${employeeForm.id}`, body)
      else await api.post('/employees', body)
      setEmployeeForm(null)
      notify(employeeForm.id ? 'Employee details saved.' : 'Employee added successfully.')
      await loadData()
    } catch (error) {
      notify(errorMessage(error), 'danger')
    } finally {
      setBusy(false)
    }
  }

  async function removeEmployee(employee) {
    if (!window.confirm(`Permanently delete ${employee.name}? This cannot be undone.`)) return
    try {
      await api.delete(`/employees/${employee.id}`)
      notify('Employee deleted.')
      await loadData()
    } catch (error) {
      notify(errorMessage(error), 'danger')
    }
  }

  async function toggleEmployee(employee) {
    try {
      await api.put(`/employees/${employee.id}/status`, { active: !employee.active })
      notify(employee.active ? 'Employee deactivated.' : 'Employee activated.')
      await loadData()
    } catch (error) {
      notify(errorMessage(error), 'danger')
    }
  }

  async function saveDepartment(event) {
    event.preventDefault()
    setBusy(true)
    try {
      if (departmentForm.id) await api.put(`/departments/${departmentForm.id}`, departmentForm)
      else await api.post('/departments', departmentForm)
      setDepartmentForm(null)
      notify(departmentForm.id ? 'Department updated.' : 'Department added.')
      await loadData()
    } catch (error) {
      notify(errorMessage(error), 'danger')
    } finally {
      setBusy(false)
    }
  }

  async function removeDepartment(department) {
    if (!window.confirm(`Delete the ${department.name} department? Departments assigned to employees cannot be deleted.`)) return
    try {
      await api.delete(`/departments/${department.id}`)
      notify('Department deleted.')
      await loadData()
    } catch (error) {
      notify(errorMessage(error), 'danger')
    }
  }

  return (
    <Shell eyebrow="WORKSPACE" title="People overview">
      <section className="stats-grid">
        <article className="stat-card"><span className="stat-icon indigo">♙</span><div><span>Total employees</span><strong>{employees.length}</strong></div></article>
        <article className="stat-card"><span className="stat-icon green">✓</span><div><span>Active employees</span><strong>{activeCount}</strong></div></article>
        <article className="stat-card"><span className="stat-icon amber">▦</span><div><span>Departments</span><strong>{departments.length}</strong></div></article>
      </section>
      {notice && <div className={`alert alert-${notice.type} py-2`} role="status">{notice.message}</div>}
      {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}
      <section className="content-card">
        <div className="section-toolbar">
          <div className="tabs" role="tablist" aria-label="Management sections">
            <button className={tab === 'employees' ? 'tab active' : 'tab'} onClick={() => setTab('employees')}>Employees <span>{employees.length}</span></button>
            <button className={tab === 'departments' ? 'tab active' : 'tab'} onClick={() => setTab('departments')}>Departments <span>{departments.length}</span></button>
          </div>
          {tab === 'employees'
            ? <div className="toolbar-actions"><input className="form-control search-input" type="search" placeholder="Search people…" aria-label="Search employees" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="btn btn-primary" onClick={() => setEmployeeForm({ ...blankEmployee })}>＋ Add employee</button></div>
            : <button className="btn btn-primary" onClick={() => setDepartmentForm({ ...blankDepartment })}>＋ Add department</button>}
        </div>
        {tab === 'employees' ? (
          <div className="table-responsive">
            <table className="table align-middle employee-table">
              <thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>CONTACT</th><th>STATUS</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
              <tbody>{employees.map((employee) => (
                <tr key={employee.id}>
                  <td><div className="person-cell"><span className="avatar">{employee.name?.slice(0, 1).toUpperCase()}</span><div><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
                  <td>{employee.departmentName || <span className="muted">Unassigned</span>}</td>
                  <td>{employee.phone || <span className="muted">—</span>}</td>
                  <td><span className={`status-pill ${employee.active ? 'status-active' : 'status-inactive'}`}>{employee.active ? 'Active' : 'Inactive'}</span></td>
                  <td><div className="row-actions"><button className="btn btn-sm btn-light" onClick={() => setEmployeeForm({ ...employee, password: '', departmentId: employee.departmentId || '' })}>Edit</button><button className="btn btn-sm btn-light" onClick={() => toggleEmployee(employee)}>{employee.active ? 'Deactivate' : 'Activate'}</button><button className="btn btn-sm btn-outline-danger" onClick={() => removeEmployee(employee)} aria-label={`Delete ${employee.name}`}>Delete</button></div></td>
                </tr>
              ))}</tbody>
            </table>
            {!employees.length && <div className="empty-state"><span>♙</span><strong>No employees found</strong><p>Try another search or add a team member.</p></div>}
          </div>
        ) : (
          <div className="department-list">{departments.map((department) => (
            <article className="department-row" key={department.id}>
              <span className="department-icon">▦</span><div className="department-copy"><strong>{department.name}</strong><span>{department.description || 'No description provided'}</span></div>
              <div className="row-actions"><button className="btn btn-sm btn-light" onClick={() => setDepartmentForm({ id: department.id, name: department.name, description: department.description || '' })}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => removeDepartment(department)}>Delete</button></div>
            </article>
          ))}{!departments.length && <div className="empty-state"><strong>No departments yet</strong><p>Create departments to organize your team.</p></div>}</div>
        )}
      </section>
      {employeeForm && <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEmployeeForm(null)}><section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="employee-dialog-title">
        <div className="dialog-heading"><div><span className="eyebrow">{employeeForm.id ? 'EMPLOYEE DETAILS' : 'NEW TEAM MEMBER'}</span><h2 id="employee-dialog-title">{employeeForm.id ? 'Edit employee' : 'Add employee'}</h2></div><button className="btn-close" aria-label="Close" onClick={() => setEmployeeForm(null)} /></div>
        <form onSubmit={saveEmployee}><div className="form-grid">
          <div className="field-span"><label className="form-label" htmlFor="employee-name">Full name</label><input id="employee-name" className="form-control" required maxLength="100" value={employeeForm.name} onChange={(event) => setEmployeeForm({ ...employeeForm, name: event.target.value })} /></div>
          <div className="field-span"><label className="form-label" htmlFor="employee-email">Work email</label><input id="employee-email" className="form-control" type="email" required value={employeeForm.email} onChange={(event) => setEmployeeForm({ ...employeeForm, email: event.target.value })} /></div>
          <div><label className="form-label" htmlFor="employee-phone">Phone</label><input id="employee-phone" className="form-control" maxLength="30" value={employeeForm.phone || ''} onChange={(event) => setEmployeeForm({ ...employeeForm, phone: event.target.value })} /></div>
          <div><label className="form-label" htmlFor="employee-department">Department</label><select id="employee-department" className="form-select" value={employeeForm.departmentId || ''} onChange={(event) => setEmployeeForm({ ...employeeForm, departmentId: event.target.value })}><option value="">Unassigned</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div className="field-span"><label className="form-label" htmlFor="employee-address">Address</label><input id="employee-address" className="form-control" maxLength="255" value={employeeForm.address || ''} onChange={(event) => setEmployeeForm({ ...employeeForm, address: event.target.value })} /></div>
          <div className="field-span"><label className="form-label" htmlFor="employee-password">{employeeForm.id ? 'New password (optional)' : 'Temporary password'}</label><input id="employee-password" className="form-control" type="password" minLength="8" maxLength="72" required={!employeeForm.id} autoComplete="new-password" value={employeeForm.password} onChange={(event) => setEmployeeForm({ ...employeeForm, password: event.target.value })} /><div className="form-text">At least 8 characters. Share this password securely with the employee.</div></div>
        </div><div className="dialog-actions"><button type="button" className="btn btn-light" onClick={() => setEmployeeForm(null)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save employee'}</button></div></form>
      </section></div>}
      {departmentForm && <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDepartmentForm(null)}><section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="department-dialog-title">
        <div className="dialog-heading"><div><span className="eyebrow">ORGANIZATION</span><h2 id="department-dialog-title">{departmentForm.id ? 'Edit department' : 'Add department'}</h2></div><button className="btn-close" aria-label="Close" onClick={() => setDepartmentForm(null)} /></div>
        <form onSubmit={saveDepartment}><label className="form-label" htmlFor="department-name">Department name</label><input id="department-name" className="form-control mb-3" required maxLength="80" value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} /><label className="form-label" htmlFor="department-description">Description</label><textarea id="department-description" className="form-control" rows="3" maxLength="500" value={departmentForm.description} onChange={(event) => setDepartmentForm({ ...departmentForm, description: event.target.value })} /><div className="dialog-actions"><button type="button" className="btn btn-light" onClick={() => setDepartmentForm(null)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save department'}</button></div></form>
      </section></div>}
    </Shell>
  )
}
