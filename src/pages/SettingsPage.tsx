import { useState, type FormEvent } from 'react'
import {
  defaultAcademicSettings,
  loadAcademicSettings,
  saveAcademicSettings,
  type AcademicCalendarActivity,
  type AcademicHierarchyId,
  type AcademicPeriod,
  type AcademicSettings,
} from './AcademicSettings'
import SisLayout from './SisLayout'
import './SettingsPage.css'

const hierarchyLabels: Record<AcademicHierarchyId, string> = {
  tertiary: 'Tertiary Education',
  secondary: 'Senior High School',
}

function createActivityId() {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 'Dates not set'
  return `${formatActivityDate(startDate)} – ${formatActivityDate(endDate)}`
}

function loadInitialSettings() {
  try {
    return { settings: loadAcademicSettings(), error: '' }
  } catch (error: unknown) {
    return {
      settings: defaultAcademicSettings,
      error: error instanceof Error ? error.message : 'Could not load academic settings.',
    }
  }
}

function SettingsPage() {
  const [initialState] = useState(loadInitialSettings)
  const [settings, setSettings] = useState<AcademicSettings>(initialState.settings)
  const [periodDrafts, setPeriodDrafts] = useState(settings.periods)
  const [activityTitle, setActivityTitle] = useState('')
  const [activityStartDate, setActivityStartDate] = useState('')
  const [activityEndDate, setActivityEndDate] = useState('')
  const [activityDetails, setActivityDetails] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [initialLoadError, setInitialLoadError] = useState(initialState.error)

  function persist(nextSettings: AcademicSettings, successMessage: string) {
    try {
      saveAcademicSettings(nextSettings)
      setSettings(nextSettings)
      setError('')
      setInitialLoadError('')
      setNotice(successMessage)
      return true
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save academic settings.')
      setNotice('')
      return false
    }
  }

  function handlePeriodSubmit(
    event: FormEvent<HTMLFormElement>,
    hierarchyId: AcademicHierarchyId,
  ) {
    event.preventDefault()
    const period = periodDrafts[hierarchyId]
    if (!period.startDate || !period.endDate) {
      setError(`Enter both dates for the ${hierarchyLabels[hierarchyId]} academic period.`)
      setNotice('')
      return
    }
    if (period.startDate > period.endDate) {
      setError('The academic period end date must be on or after its start date.')
      setNotice('')
      return
    }

    persist(
      {
        ...settings,
        periods: { ...settings.periods, [hierarchyId]: period },
      },
      `${hierarchyLabels[hierarchyId]} academic period saved.`,
    )
  }

  function updatePeriodDraft(
    hierarchyId: AcademicHierarchyId,
    field: keyof AcademicPeriod,
    value: string,
  ) {
    setPeriodDrafts((current) => ({
      ...current,
      [hierarchyId]: { ...current[hierarchyId], [field]: value },
    }))
    setError('')
    setNotice('')
  }

  function handleActivitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = activityTitle.trim()
    if (!title || !activityStartDate || !activityEndDate) {
      setError('Enter an activity title, start date, and end date.')
      setNotice('')
      return
    }
    if (activityStartDate > activityEndDate) {
      setError('The activity end date must be on or after its start date.')
      setNotice('')
      return
    }
    if (settings.activities.some((activity) =>
      activity.title.toLowerCase() === title.toLowerCase() &&
      activity.startDate === activityStartDate &&
      activity.endDate === activityEndDate,
    )) {
      setError('This activity already exists for that date range.')
      setNotice('')
      return
    }

    const activity: AcademicCalendarActivity = {
      id: createActivityId(),
      title,
      startDate: activityStartDate,
      endDate: activityEndDate,
      details: activityDetails.trim(),
    }
    const nextSettings = {
      ...settings,
      activities: [...settings.activities, activity].sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      ),
    }
    if (persist(nextSettings, 'Calendar activity added.')) {
      setActivityTitle('')
      setActivityStartDate('')
      setActivityEndDate('')
      setActivityDetails('')
    }
  }

  function removeActivity(activity: AcademicCalendarActivity) {
    const nextSettings = {
      ...settings,
      activities: settings.activities.filter((item) => item.id !== activity.id),
    }
    persist(nextSettings, 'Calendar activity removed.')
  }

  return (
    <SisLayout
      active="Settings"
      breadcrumb="Settings"
      breadcrumbRoot="System"
      breadcrumbHref="#settings"
      title="Academic Settings"
      subtitle="Set academic date ranges by education level and manage calendar activities."
      icon="settings"
    >
      <div className="settings-page">
        <div className="settings-storage-note">
          These settings are saved in this browser and are used by the notification bell on this device.
        </div>
        {initialLoadError && <p className="settings-feedback is-error" role="alert">{initialLoadError}</p>}
        {error && <p className="settings-feedback is-error" role="alert">{error}</p>}
        {notice && <p className="settings-feedback" role="status">{notice}</p>}

        <section className="settings-panel" aria-labelledby="academic-period-title">
          <div className="settings-panel-heading">
            <h2 id="academic-period-title">Academic periods by educational hierarchy</h2>
            <p>Set a separate start and end date for each education level.</p>
          </div>
          <div className="settings-period-list">
            {(['tertiary', 'secondary'] as const).map((hierarchyId) => (
              <form
                className="settings-period-card"
                key={hierarchyId}
                onSubmit={(event) => handlePeriodSubmit(event, hierarchyId)}
              >
                <h3>{hierarchyLabels[hierarchyId]}</h3>
                <div className="settings-date-range">
                  <label>
                    Start date
                    <input
                      type="date"
                      value={periodDrafts[hierarchyId].startDate}
                      onChange={(event) => updatePeriodDraft(hierarchyId, 'startDate', event.currentTarget.value)}
                      required
                    />
                  </label>
                  <label>
                    End date
                    <input
                      type="date"
                      min={periodDrafts[hierarchyId].startDate || undefined}
                      value={periodDrafts[hierarchyId].endDate}
                      onChange={(event) => updatePeriodDraft(hierarchyId, 'endDate', event.currentTarget.value)}
                      required
                    />
                  </label>
                </div>
                <button className="settings-primary-button" type="submit">
                  Save {hierarchyLabels[hierarchyId]} period
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="settings-panel" aria-labelledby="academic-calendar-title">
          <div className="settings-panel-heading">
            <h2 id="academic-calendar-title">Academic calendar of activities</h2>
            <p>Add events with a start and end date. Upcoming and in-progress activities appear in the top-bar notification bell.</p>
          </div>
          <form className="settings-activity-form" onSubmit={handleActivitySubmit}>
            <label>
              Activity title
              <input
                value={activityTitle}
                onChange={(event) => setActivityTitle(event.currentTarget.value)}
                maxLength={100}
                placeholder="e.g. Midterm examinations"
                required
              />
            </label>
            <label>
              Start date
              <input
                type="date"
                value={activityStartDate}
                onChange={(event) => setActivityStartDate(event.currentTarget.value)}
                required
              />
            </label>
            <label>
              End date
              <input
                type="date"
                min={activityStartDate || undefined}
                value={activityEndDate}
                onChange={(event) => setActivityEndDate(event.currentTarget.value)}
                required
              />
            </label>
            <label className="settings-activity-details">
              Details <span>(optional)</span>
              <input
                value={activityDetails}
                onChange={(event) => setActivityDetails(event.currentTarget.value)}
                maxLength={200}
                placeholder="Location or additional information"
              />
            </label>
            <button className="settings-primary-button" type="submit">Add calendar activity</button>
          </form>

          <div className="settings-activity-list">
            {settings.activities.length ? settings.activities.map((activity) => (
              <article className="settings-activity-item" key={activity.id}>
                <span className="settings-activity-date">
                  {formatDateRange(activity.startDate, activity.endDate)}
                </span>
                <div>
                  <strong>{activity.title}</strong>
                  {activity.details && <p>{activity.details}</p>}
                </div>
                <button
                  type="button"
                  className="settings-remove-button"
                  aria-label={`Remove ${activity.title}`}
                  onClick={() => removeActivity(activity)}
                >
                  Remove
                </button>
              </article>
            )) : (
              <p className="settings-empty">No calendar activities added yet.</p>
            )}
          </div>
        </section>
      </div>
    </SisLayout>
  )
}

export default SettingsPage
