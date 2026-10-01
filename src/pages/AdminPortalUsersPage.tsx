import { useEffect, useState, type DragEvent, type FormEvent } from 'react'
import {
  createPortalUser,
  deletePortalUser,
  getAdminCatalog,
  getAdminSession,
  getPortalUsers,
  resetPortalUserPassword,
  updatePortalUser,
  type AdminCatalogEntry,
  type PortalUserRecord,
} from '../api/adminApi'
import SisLayout from './SisLayout'
import './AdminPortalUsersPage.css'

function AdminPortalUsersPage() {
  const [users, setUsers] = useState<PortalUserRecord[]>([])
  const [positions, setPositions] = useState<AdminCatalogEntry[]>([])
  const [designations, setDesignations] = useState<AdminCatalogEntry[]>([])
  const [newPassword, setNewPassword] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [positionIds, setPositionIds] = useState<string[]>([])
  const [designationIds, setDesignationIds] = useState<string[]>([])
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [catalogsLoading, setCatalogsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [managementError, setManagementError] = useState('')
  const [managementMessage, setManagementMessage] = useState('')
  const [draggingOver, setDraggingOver] = useState<'positions' | 'designations' | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const session = getAdminSession()
    if (!session) {
      queueMicrotask(() => {
        if (controller.signal.aborted) return
        setLoadError('Your administrator session has expired. Sign in again.')
        setCatalogsLoading(false)
        setLoading(false)
      })
      return () => controller.abort()
    }

    getPortalUsers(session.accessToken, controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) setUsers(records)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(toErrorMessage(error, 'Could not load front-end users.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    Promise.all([
      getAdminCatalog(session.accessToken, 'positions', controller.signal),
      getAdminCatalog(session.accessToken, 'designations', controller.signal),
    ])
      .then(([positionEntries, designationEntries]) => {
        if (controller.signal.aborted) return
        setPositions(positionEntries)
        setDesignations(designationEntries)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(toErrorMessage(error, 'Could not load positions and designations.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const passwordChecks = [
    newPassword.length >= 12,
    /\p{Lu}/u.test(newPassword),
    /\p{Ll}/u.test(newPassword),
    /\p{Nd}/u.test(newPassword),
    /[^\p{L}\p{N}]/u.test(newPassword),
  ]
  const passwordIsStrong = passwordChecks.every(Boolean)
  const resetPasswordChecks = [
    resetPassword.length >= 12,
    /\p{Lu}/u.test(resetPassword),
    /\p{Ll}/u.test(resetPassword),
    /\p{Nd}/u.test(resetPassword),
    /[^\p{L}\p{N}]/u.test(resetPassword),
  ]
  const resetPasswordIsStrong = resetPasswordChecks.every(Boolean)
  const assignedPositions = positions.filter((entry) => positionIds.includes(entry.id))
  const assignedDesignations = designations.filter((entry) => designationIds.includes(entry.id))

  function assignCatalogEntry(type: 'positions' | 'designations', id: string) {
    const entries = type === 'positions' ? positions : designations
    if (!entries.some((entry) => entry.id === id)) return
    if (type === 'positions') {
      setPositionIds((current) => current.includes(id) ? current : [...current, id])
    } else {
      setDesignationIds((current) => current.includes(id) ? current : [...current, id])
    }
    setFormError('')
  }

  function dropCatalogEntry(event: DragEvent<HTMLDivElement>, type: 'positions' | 'designations') {
    event.preventDefault()
    setDraggingOver(null)
    const [source, id, ...extra] = event.dataTransfer.getData('text/plain').split(':')
    if (source !== type || !id || extra.length > 0) return
    assignCatalogEntry(type, id)
  }

  function startEditing(user: PortalUserRecord) {
    setEditingUserId(user.id)
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setEmail(user.email)
    setPositionIds(user.positions.map((entry) => entry.id))
    setDesignationIds(user.designations.map((entry) => entry.id))
    setFormError('')
    setManagementError('')
    setManagementMessage('')
  }

  function resetForm() {
    setEditingUserId(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setNewPassword('')
    setPositionIds([])
    setDesignationIds([])
    setFormError('')
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const session = getAdminSession()
    if (!session) {
      setFormError('Your administrator session has expired. Sign in again.')
      return
    }

    setIsCreating(true)
    setFormError('')
    try {
      const requestBody = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        positionIds,
        designationIds,
      }
      const saved = editingUserId
        ? await updatePortalUser(session.accessToken, editingUserId, requestBody)
        : await createPortalUser(session.accessToken, { ...requestBody, password: newPassword })
      setUsers((current) => (editingUserId
        ? current.map((user) => user.id === saved.id ? saved : user)
        : [...current, saved]).sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
      ))
      resetForm()
      setManagementMessage(editingUserId ? 'Front-end user updated.' : 'Front-end user created.')
    } catch (error: unknown) {
      setFormError(toErrorMessage(error, editingUserId ? 'Could not update this front-end user.' : 'Could not create this front-end user.'))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const session = getAdminSession()
    if (!session || !resettingUserId) {
      setManagementError('Your administrator session has expired. Sign in again.')
      return
    }
    setIsResetting(true)
    setManagementError('')
    try {
      await resetPortalUserPassword(session.accessToken, resettingUserId, resetPassword)
      setManagementMessage('Password reset successfully.')
      setResettingUserId(null)
      setResetPassword('')
    } catch (error: unknown) {
      setManagementError(toErrorMessage(error, 'Could not reset this password.'))
    } finally {
      setIsResetting(false)
    }
  }

  async function handleDelete(user: PortalUserRecord) {
    if (!window.confirm(`Delete the front-end account for ${user.firstName} ${user.lastName}? This cannot be undone.`)) return
    const session = getAdminSession()
    if (!session) {
      setManagementError('Your administrator session has expired. Sign in again.')
      return
    }
    setIsDeletingUserId(user.id)
    setManagementError('')
    setManagementMessage('')
    try {
      await deletePortalUser(session.accessToken, user.id)
      setUsers((current) => current.filter((record) => record.id !== user.id))
      if (editingUserId === user.id) resetForm()
      if (resettingUserId === user.id) setResettingUserId(null)
      setManagementMessage('Front-end user deleted.')
    } catch (error: unknown) {
      setManagementError(toErrorMessage(error, 'Could not delete this front-end user.'))
    } finally {
      setIsDeletingUserId(null)
    }
  }

  return (
    <SisLayout
      active="Front-end Users"
      breadcrumb="Front-end Users"
      title="Front-end user accounts"
      subtitle="Create front-end sign-in accounts and assign multiple positions and designations independently from system administrators."
      icon="users"
    >
      <div className="admin-portal-users-page">
        <section className="admin-portal-users-panel">
          <div className="admin-portal-users-heading">
            <div>
              <h2>{editingUserId ? 'Edit front-end user' : 'Create front-end user'}</h2>
              <p>{editingUserId ? 'Update the account profile and assigned positions and designations.' : 'These front-end accounts do not receive system administrator access.'}</p>
            </div>
          </div>
          {loadError && <p className="admin-portal-users-message is-error" role="alert">{loadError}</p>}
          <form className="admin-portal-users-form" onSubmit={handleSave}>
            <div className="admin-portal-users-fields">
              <label>
                First name
                <input name="firstName" autoComplete="given-name" maxLength={100} value={firstName}
                  onChange={(event) => setFirstName(event.currentTarget.value)} required />
              </label>
              <label>
                Last name
                <input name="lastName" autoComplete="family-name" maxLength={100} value={lastName}
                  onChange={(event) => setLastName(event.currentTarget.value)} required />
              </label>
              <label>
                Email address
                <input name="email" type="email" autoComplete="email" maxLength={254} value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)} required />
              </label>
              {!editingUserId && (
                <label>
                  Temporary password
                  <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128}
                    value={newPassword} onChange={(event) => setNewPassword(event.currentTarget.value)} required />
                  <span className={`admin-portal-password-strength is-${passwordIsStrong ? 'strong' : passwordChecks.filter(Boolean).length >= 3 ? 'medium' : 'weak'}`}>
                    <span className="admin-portal-password-meter" role="progressbar" aria-label="Password strength"
                      aria-valuemin={0} aria-valuemax={5} aria-valuenow={passwordChecks.filter(Boolean).length}>
                      {passwordChecks.map((check, index) => <span className={check ? 'is-met' : ''} key={index} />)}
                    </span>
                    <strong aria-live="polite">
                      {newPassword ? passwordIsStrong ? 'Strong' : passwordChecks.filter(Boolean).length >= 3 ? 'Medium' : 'Weak' : 'Password strength'}
                    </strong>
                  </span>
                  <small>At least 12 characters; include uppercase, lowercase, number, and symbol.</small>
                </label>
              )}
            </div>
              <section className="admin-portal-assignment" aria-labelledby="portal-assignment-title">
                <h3 id="portal-assignment-title">Positions and designations</h3>
                <p>Drag or click to assign multiple entries. Remove any assignment with its × button.</p>
                {catalogsLoading ? (
                  <p role="status">Loading positions and designations…</p>
                ) : (
                  <>
                    <div className="admin-portal-drop-zones">
                      <div
                        className={`admin-portal-drop-zone${draggingOver === 'positions' ? ' is-over' : ''}`}
                        onDragOver={(event) => { event.preventDefault(); setDraggingOver('positions') }}
                        onDragLeave={() => setDraggingOver(null)}
                        onDrop={(event) => dropCatalogEntry(event, 'positions')}
                      >
                        <strong>Positions</strong>
                        {assignedPositions.length === 0 && <span>Drop positions here</span>}
                        {assignedPositions.map((entry) => (
                          <span className="admin-portal-assigned-chip" key={entry.id}>
                            {entry.name}
                            <button type="button" onClick={() => setPositionIds((current) => current.filter((id) => id !== entry.id))}
                              aria-label={`Remove position ${entry.name}`}>×</button>
                          </span>
                        ))}
                      </div>
                      <div
                        className={`admin-portal-drop-zone${draggingOver === 'designations' ? ' is-over' : ''}`}
                        onDragOver={(event) => { event.preventDefault(); setDraggingOver('designations') }}
                        onDragLeave={() => setDraggingOver(null)}
                        onDrop={(event) => dropCatalogEntry(event, 'designations')}
                      >
                        <strong>Designations</strong>
                        {assignedDesignations.length === 0 && <span>Drop designations here</span>}
                        {assignedDesignations.map((entry) => (
                          <span className="admin-portal-assigned-chip" key={entry.id}>
                            {entry.name}
                            <button type="button" onClick={() => setDesignationIds((current) => current.filter((id) => id !== entry.id))}
                              aria-label={`Remove designation ${entry.name}`}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="admin-portal-catalog-lists">
                      <div>
                        <h4>Positions</h4>
                        {positions.map((entry) => (
                          <button type="button" key={entry.id} draggable
                            onDragStart={(event) => event.dataTransfer.setData('text/plain', `positions:${entry.id}`)}
                            onClick={() => assignCatalogEntry('positions', entry.id)}>{entry.name}</button>
                        ))}
                        {positions.length === 0 && <small>No positions are available.</small>}
                      </div>
                      <div>
                        <h4>Designations</h4>
                        {designations.map((entry) => (
                          <button type="button" key={entry.id} draggable
                            onDragStart={(event) => event.dataTransfer.setData('text/plain', `designations:${entry.id}`)}
                            onClick={() => assignCatalogEntry('designations', entry.id)}>{entry.name}</button>
                        ))}
                        {designations.length === 0 && <small>No designations are available.</small>}
                      </div>
                    </div>
                  </>
                )}
              </section>

            {formError && <p className="admin-portal-users-message is-error" role="alert">{formError}</p>}
            <div className="admin-portal-user-form-actions">
              <button className="admin-portal-users-submit" type="submit"
                disabled={isCreating || (!editingUserId && !passwordIsStrong) || catalogsLoading}>
                {isCreating ? 'Saving…' : editingUserId ? 'Save changes' : 'Create front-end user'}
              </button>
              {editingUserId && <button className="admin-portal-user-action" type="button" onClick={resetForm}>Cancel edit</button>}
            </div>
          </form>
        </section>

        <section className="admin-portal-users-panel" aria-labelledby="portal-users-list-title">
          <div className="admin-portal-users-heading">
            <div>
              <h2 id="portal-users-list-title">Front-end user accounts</h2>
              <p>{users.length.toLocaleString()} {users.length === 1 ? 'account' : 'accounts'}</p>
            </div>
          </div>
          {loading && <p className="admin-portal-users-message" role="status">Loading accounts…</p>}
          {managementError && <p className="admin-portal-users-message is-error" role="alert">{managementError}</p>}
          {managementMessage && <p className="admin-portal-users-message" role="status">{managementMessage}</p>}
          {!loading && !loadError && users.length === 0 && <p className="admin-portal-users-message">No front-end user accounts have been created.</p>}
          <div className="admin-portal-users-list">
            {users.map((user) => (
              <article key={user.id} className="admin-portal-users-row">
                <span className="admin-portal-user-type">Front-end user</span>
                <span className="admin-portal-user-info">
                  <strong>{user.firstName} {user.lastName}</strong>
                  <small>{user.email}</small>
                  <small>
                    Positions: {user.positions.map((entry) => entry.name).join(', ') || 'None'} ·
                    {' '}Designations: {user.designations.map((entry) => entry.name).join(', ') || 'None'}
                  </small>
                </span>
                <div className="admin-portal-user-actions">
                  <button className="admin-portal-user-action" type="button" onClick={() => startEditing(user)}>Edit</button>
                  <button className="admin-portal-user-action" type="button" onClick={() => {
                    setResettingUserId(resettingUserId === user.id ? null : user.id)
                    setResetPassword('')
                    setManagementError('')
                  }}>Reset password</button>
                  <button className="admin-portal-user-action is-danger" type="button"
                    disabled={isDeletingUserId === user.id} onClick={() => void handleDelete(user)}>
                    {isDeletingUserId === user.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
                {resettingUserId === user.id && (
                  <form className="admin-portal-reset-form" onSubmit={handleResetPassword}>
                    <label>
                      New password
                      <input type="password" autoComplete="new-password" minLength={12} maxLength={128}
                        value={resetPassword} onChange={(event) => setResetPassword(event.currentTarget.value)} required />
                    </label>
                    <small>At least 12 characters; include uppercase, lowercase, number, and symbol.</small>
                    <button className="admin-portal-user-action" type="submit" disabled={isResetting || !resetPasswordIsStrong}>
                      {isResetting ? 'Resetting…' : 'Save password'}
                    </button>
                    <button className="admin-portal-user-action" type="button" onClick={() => setResettingUserId(null)}>Cancel</button>
                  </form>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </SisLayout>
  )
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof TypeError) return 'Could not reach the API. Check that the API is running and try again.'
  return error instanceof Error ? error.message : fallback
}

export default AdminPortalUsersPage
