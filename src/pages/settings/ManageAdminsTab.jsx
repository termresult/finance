import { useEffect, useState } from 'react'
import {
  apiErrorMessage,
  financeData,
  getFinanceAdmin,
} from '../../services/api'
import Modal from '../../components/Modal'

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
}

export default function ManageAdminsTab({ showToast }) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const me = getFinanceAdmin()

  async function load() {
    setLoading(true)
    try {
      const res = await financeData.admins()
      setAdmins(res.data.data || [])
    } catch (err) {
      showToast?.(apiErrorMessage(err, 'Could not load admins'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(admin) {
    setEditing(admin)
    setForm({
      full_name: admin.full_name || '',
      email: admin.email || '',
      password: '',
    })
    setOpen(true)
  }

  async function submit() {
    if (!form.full_name.trim() || !form.email.trim()) return
    if (!editing && !form.password) return
    setBusy(true)
    try {
      if (editing) {
        await financeData.updateAdmin(editing.id, {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password || undefined,
        })
        showToast?.('Admin updated')
      } else {
        await financeData.createAdmin({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
        })
        showToast?.('Finance admin created')
      }
      setOpen(false)
      await load()
    } catch (err) {
      showToast?.(apiErrorMessage(err, 'Could not save admin'))
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(admin) {
    try {
      if (admin.is_active) {
        await financeData.deactivateAdmin(admin.id)
        showToast?.('Admin deactivated')
      } else {
        await financeData.activateAdmin(admin.id)
        showToast?.('Admin activated')
      }
      await load()
    } catch (err) {
      showToast?.(apiErrorMessage(err, 'Could not update admin status'))
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Manage finance admins</h2>
          <p>Add, edit, or deactivate finance administrators</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={openCreate}>
          Add admin
        </button>
      </div>
      <div className="panel-body">
        {loading ? (
          <div className="muted">Loading admins…</div>
        ) : admins.length === 0 ? (
          <div className="empty">No finance admins yet.</div>
        ) : (
          <div className="admin-list">
            {admins.map((admin) => {
              const initials = String(admin.full_name || 'FA')
                .split(/\s+/)
                .map((p) => p[0]?.toUpperCase() || '')
                .join('')
                .slice(0, 2)
              const isMe = me?.id === admin.id
              return (
                <div className="admin-row" key={admin.id}>
                  <div className="admin-row-main">
                    <div className="user-avatar">{initials || 'FA'}</div>
                    <div className="admin-row-copy">
                      <strong>
                        {admin.full_name}
                        {isMe ? ' (you)' : ''}
                      </strong>
                      <small>{admin.email}</small>
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <span className={`status ${admin.is_active ? 'paid' : 'overdue'}`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => openEdit(admin)}>
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm ${admin.is_active ? 'btn-danger' : 'btn-success'}`}
                      type="button"
                      disabled={isMe && admin.is_active}
                      onClick={() => toggleActive(admin)}
                    >
                      {admin.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {open ? (
        <Modal
          title={editing ? 'Edit finance admin' : 'Add finance admin'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={submit} disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <label className="field-label full">
              Full name
              <input
                className="field"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                required
              />
            </label>
            <label className="field-label full">
              Email
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </label>
            <label className="field-label full">
              {editing ? 'New password (optional)' : 'Password'}
              <input
                className="field"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                minLength={editing ? undefined : 8}
                required={!editing}
                placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'}
              />
            </label>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}
