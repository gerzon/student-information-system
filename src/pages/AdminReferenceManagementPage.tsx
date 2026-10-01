import { useEffect, useState, type FormEvent } from 'react'
import {
  createAdminCatalogEntry,
  deleteAdminCatalogEntry,
  getAdminCatalog,
  getAdminSession,
  updateAdminCatalogEntry,
  type AdminCatalogEntry,
  type AdminCatalogType,
} from '../api/adminApi'
import SisLayout from './SisLayout'
import { SisIcon, type SisIconName } from './SisIcon'
import './AdminReferenceManagementPage.css'

export type AdminReferenceType = Exclude<AdminCatalogType, 'access-levels'>

const managementDetails: Record<
  AdminReferenceType,
  {
    title: string
    description: string
    meaning: string
    examples: string[]
    icon: SisIconName
    singular: string
  }
> = {
  positions: {
    title: 'Positions',
    description: 'Manage official institutional positions.',
    meaning: 'Positions describe an employee’s official role within the institution.',
    examples: ['Faculty', 'Staff', 'Registrar', 'Human Resources'],
    icon: 'users',
    singular: 'position',
  },
  designations: {
    title: 'Designations',
    description: 'Manage assigned responsibilities and designations.',
    meaning: 'Designations describe the specific responsibility or administrative assignment given to an employee.',
    examples: ['Department chair', 'Program coordinator', 'Registrar-in-charge'],
    icon: 'reports',
    singular: 'designation',
  },
}

function AdminReferenceManagementPage({ type }: { type: AdminReferenceType }) {
  const details = managementDetails[type]
  const [entries, setEntries] = useState<AdminCatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const session = getAdminSession()

    if (!session) {
      queueMicrotask(() => {
        if (controller.signal.aborted) return
        setLoadError('Your administrator session has expired. Sign in again to manage this catalog.')
        setLoading(false)
      })
      return () => controller.abort()
    }

    getAdminCatalog(session.accessToken, type, controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) setEntries(records)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(
          error instanceof TypeError
            ? 'Could not reach the API. Check that the API is running and try again.'
            : error instanceof Error
              ? error.message
              : `Could not load ${details.title.toLowerCase()}.`,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [details.title, type])

  function resetForm() {
    setName('')
    setDescription('')
    setEditingId(null)
    setFormError('')
  }

  function beginEdit(entry: AdminCatalogEntry) {
    setEditingId(entry.id)
    setName(entry.name)
    setDescription(entry.description)
    setFormError('')
    document.getElementById('admin-reference-name')?.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const session = getAdminSession()
    if (!session) {
      setFormError('Your administrator session has expired. Sign in again.')
      return
    }

    setIsSaving(true)
    setFormError('')
    try {
      const request = { name: name.trim(), description: description.trim() }
      const savedEntry = editingId
        ? await updateAdminCatalogEntry(session.accessToken, type, editingId, request)
        : await createAdminCatalogEntry(session.accessToken, type, request)

      setEntries((current) =>
        [...current.filter((entry) => entry.id !== savedEntry.id), savedEntry]
          .sort((left, right) => left.name.localeCompare(right.name)),
      )
      resetForm()
    } catch (error: unknown) {
      setFormError(
        error instanceof TypeError
          ? 'Could not reach the API. Check that the API is running and try again.'
          : error instanceof Error
            ? error.message
            : `Could not save this ${details.singular}.`,
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(entry: AdminCatalogEntry) {
    if (!window.confirm(`Delete the ${details.singular} "${entry.name}"?`)) return
    const session = getAdminSession()
    if (!session) {
      setLoadError('Your administrator session has expired. Sign in again to manage this catalog.')
      return
    }

    setDeletingId(entry.id)
    setLoadError('')
    try {
      await deleteAdminCatalogEntry(session.accessToken, type, entry.id)
      setEntries((current) => current.filter((item) => item.id !== entry.id))
      if (editingId === entry.id) resetForm()
    } catch (error: unknown) {
      setLoadError(
        error instanceof TypeError
          ? 'Could not reach the API. Check that the API is running and try again.'
          : error instanceof Error
            ? error.message
            : `Could not delete this ${details.singular}.`,
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <SisLayout
      active={details.title}
      breadcrumb={details.title}
      title={`Manage ${details.title.toLowerCase()}`}
      subtitle={details.description}
      icon={details.icon}
    >
      <div className="admin-reference-page">
        <section className="admin-reference-intro">
          <span className="admin-reference-icon">
            <SisIcon name={details.icon} />
          </span>
          <div>
            <span className="admin-reference-eyebrow">ADMINISTRATION</span>
            <h2>{details.title}</h2>
            <p>{details.meaning}</p>
          </div>
        </section>

        <section className="admin-reference-panel" aria-labelledby="admin-reference-list-title">
          <div className="admin-reference-panel-heading">
            <div>
              <h2 id="admin-reference-list-title">{details.title} directory</h2>
              <p>{entries.length.toLocaleString()} {entries.length === 1 ? 'entry' : 'entries'}</p>
            </div>
            <button
              type="button"
              className="admin-reference-add-button"
              onClick={() => {
                resetForm()
                document.getElementById('admin-reference-name')?.focus()
              }}
            >
              Add {details.singular}
            </button>
          </div>

          {loadError && <p className="admin-reference-message is-error" role="alert">{loadError}</p>}
          {loading && <p className="admin-reference-message" role="status">Loading {details.title.toLowerCase()}…</p>}
          {!loading && !loadError && entries.length === 0 && (
            <div className="admin-reference-empty" role="status">
              <SisIcon name={details.icon} />
              <strong>No {details.title.toLowerCase()} yet</strong>
              <span>Add the first entry using the form below.</span>
            </div>
          )}

          {entries.length > 0 && (
            <div className="admin-reference-list">
              {entries.map((entry) => (
                <article className="admin-reference-row" key={entry.id}>
                  <span className="admin-reference-row-icon"><SisIcon name={details.icon} /></span>
                  <span className="admin-reference-entry-copy">
                    <strong>{entry.name}</strong>
                    <small>{entry.description || 'No description'}</small>
                  </span>
                  <div className="admin-reference-actions">
                    <button
                      type="button"
                      className="admin-reference-edit"
                      onClick={() => beginEdit(entry)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-reference-delete"
                      onClick={() => void handleDelete(entry)}
                      disabled={deletingId === entry.id}
                    >
                      {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-reference-panel" aria-labelledby="admin-reference-form-title">
          <div className="admin-reference-panel-heading">
            <div>
              <h2 id="admin-reference-form-title">
                {editingId ? `Edit ${details.singular}` : `Add ${details.singular}`}
              </h2>
              <p>{editingId ? 'Update the selected entry.' : `Create a new ${details.singular}.`}</p>
            </div>
          </div>
          <form className="admin-reference-form" onSubmit={handleSubmit}>
            <label htmlFor="admin-reference-name">Name</label>
            <input
              id="admin-reference-name"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              maxLength={100}
              required
            />
            <label htmlFor="admin-reference-description">Description <span>(optional)</span></label>
            <textarea
              id="admin-reference-description"
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              maxLength={500}
              rows={3}
            />
            {formError && <p className="admin-reference-message is-error" role="alert">{formError}</p>}
            <div className="admin-reference-form-actions">
              <button type="submit" className="admin-reference-save" disabled={isSaving}>
                {isSaving ? 'Saving…' : editingId ? 'Save changes' : `Add ${details.singular}`}
              </button>
              {editingId && (
                <button type="button" className="admin-reference-cancel" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-reference-panel">
          <h2>About {details.title.toLowerCase()}</h2>
          <p className="admin-reference-description">{details.description}</p>
          <ul className="admin-reference-examples">
            {details.examples.map((example) => <li key={example}>{example}</li>)}
          </ul>
        </section>
      </div>
    </SisLayout>
  )
}

export default AdminReferenceManagementPage
