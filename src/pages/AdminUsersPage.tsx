import { useEffect, useState, type FormEvent } from 'react'
import {
  createAdmin,
  getCurrentAdminEmail,
  getAdminSession,
  getAdmins,
  type AdminRecord,
} from '../api/adminApi'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './AdminUsersPage.css'

function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const currentAdminEmail = getCurrentAdminEmail()
  const passwordChecks = [
    newAdminPassword.length >= 12,
    /\p{Lu}/u.test(newAdminPassword),
    /\p{Ll}/u.test(newAdminPassword),
    /\p{Nd}/u.test(newAdminPassword),
    /[^\p{L}\p{N}]/u.test(newAdminPassword),
  ]
  const passwordStrengthScore = passwordChecks.filter(Boolean).length
  const passwordStrength =
    passwordStrengthScore === passwordChecks.length
      ? 'strong'
      : passwordStrengthScore >= 3
        ? 'medium'
        : 'weak'
  const passwordIsStrong = passwordStrength === 'strong'

  useEffect(() => {
    const controller = new AbortController()
    const session = getAdminSession()
    if (!session) {
      queueMicrotask(() => {
        if (controller.signal.aborted) return
        setLoadError('Your administrator session has expired. Sign in again to manage accounts.')
        setLoading(false)
      })
      return () => controller.abort()
    }

    getAdmins(session.accessToken, controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) setAdmins(records)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(
          error instanceof TypeError
            ? 'Could not reach the API. Check that the API is running and try again.'
            : error instanceof Error
              ? error.message
              : 'Could not load administrator accounts.',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  async function loadAdmins() {
    const session = getAdminSession()
    if (!session) {
      setAdmins([])
      setLoadError('Your administrator session has expired. Sign in again to manage accounts.')
      setLoading(false)
      return
    }

    setLoadError('')
    try {
      setAdmins(await getAdmins(session.accessToken))
    } catch (error: unknown) {
      setLoadError(
        error instanceof TypeError
          ? 'Could not reach the API. Check that the API is running and try again.'
          : error instanceof Error
            ? error.message
            : 'Could not load administrator accounts.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const session = getAdminSession()
    if (!session) {
      setFormError('Your administrator session has expired. Sign in again.')
      return
    }
    setIsCreating(true)
    setFormError('')
    try {
      const createdAdmin = await createAdmin(session.accessToken, { email, password })
      setAdmins((current) =>
        [...current, createdAdmin].sort((left, right) => left.email.localeCompare(right.email)),
      )
      form.reset()
      setNewAdminPassword('')
    } catch (error: unknown) {
      setFormError(
        error instanceof TypeError
          ? 'Could not reach the API. Check that the API is running and try again.'
          : error instanceof Error
            ? error.message
            : 'Could not create the administrator account.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <SisLayout
      active="System Administrators"
      breadcrumb="System Administrators"
      title="System administrator accounts"
      subtitle="Create and manage accounts with administrator access."
      icon="users"
    >
      <div className="admin-users-page">
        <section className="admin-users-intro">
          <span className="admin-users-intro-icon"><SisIcon name="shield" /></span>
          <div>
            <h2>Administrator accounts</h2>
            <p>These accounts can access protected student and system records.</p>
          </div>
          <span className="admin-users-count">
            {admins.length.toLocaleString()} {admins.length === 1 ? 'account' : 'accounts'}
          </span>
        </section>

        <section className="admin-users-panel" aria-labelledby="admin-users-list-title">
          <div className="admin-users-panel-heading">
            <div>
              <h2 id="admin-users-list-title">Manage accounts</h2>
              <p>Only create accounts for trusted system administrators.</p>
            </div>
            <button
              type="button"
              className="admin-users-refresh"
              onClick={() => {
                setLoading(true)
                void loadAdmins()
              }}
              disabled={loading}
            >
              Reload accounts
            </button>
          </div>

          {loadError && (
            <div className="admin-users-message is-error" role="alert">
              {loadError}
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  void loadAdmins()
                }}
              >
                Retry
              </button>
            </div>
          )}
          {loading && <p className="admin-users-message" role="status">Loading accounts…</p>}

          <div className="admin-users-list">
            {!loading && admins.length === 0 && !loadError && (
              <p className="admin-users-empty">No administrator accounts were found.</p>
            )}
            {admins.map((admin) => (
              <article className="admin-users-row" key={admin.id}>
                <span className="admin-users-avatar" aria-hidden="true">
                  {admin.email.charAt(0).toUpperCase()}
                </span>
                <span className="admin-users-account">
                  <strong>{admin.email}</strong>
                  <small>
                    {currentAdminEmail?.toLowerCase() === admin.email.toLowerCase()
                      ? 'Current account'
                      : 'Administrator'}
                  </small>
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-users-panel" aria-labelledby="admin-users-create-title">
          <div className="admin-users-panel-heading">
            <div>
              <h2 id="admin-users-create-title">Create administrator account</h2>
              <p>New accounts receive administrator privileges immediately.</p>
            </div>
          </div>
          <form className="admin-users-form" onSubmit={handleCreateAdmin}>
            <label>
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                maxLength={254}
                placeholder="admin@example.com"
                required
              />
            </label>
            <label>
              Temporary password
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={newAdminPassword}
                onChange={(event) => setNewAdminPassword(event.currentTarget.value)}
                minLength={12}
                maxLength={128}
                placeholder="At least 12 characters"
                required
              />
              <span className={`admin-users-password-strength is-${newAdminPassword ? passwordStrength : 'empty'}`}>
                <span
                  className="admin-users-password-meter"
                  role="progressbar"
                  aria-label="Password strength"
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={passwordStrengthScore}
                >
                  {passwordChecks.map((check, index) => (
                    <span
                      className={check ? 'is-met' : ''}
                      key={index}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <strong aria-live="polite">
                  {newAdminPassword
                    ? passwordStrength[0].toUpperCase() + passwordStrength.slice(1)
                    : 'Password strength'}
                </strong>
              </span>
              <small>Must include uppercase, lowercase, number, and symbol.</small>
            </label>
            <button
              type="submit"
              className="admin-users-create"
              disabled={isCreating || !passwordIsStrong}
            >
              {isCreating ? 'Creating…' : 'Create administrator'}
            </button>
          </form>
          {formError && <p className="admin-users-message is-error" role="alert">{formError}</p>}
        </section>
      </div>
    </SisLayout>
  )
}

export default AdminUsersPage
