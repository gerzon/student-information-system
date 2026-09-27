export type AcademicHierarchyId = 'tertiary' | 'secondary'

export type AcademicPeriod = {
  startDate: string
  endDate: string
}

export type AcademicCalendarActivity = {
  id: string
  title: string
  startDate: string
  endDate: string
  details: string
}

export type AcademicSettings = {
  periods: Record<AcademicHierarchyId, AcademicPeriod>
  activities: AcademicCalendarActivity[]
}

type StoredCalendarActivity = Partial<AcademicCalendarActivity> & {
  date?: unknown
}

const storageKey = 'sis-academic-settings-v1'

const emptyPeriod: AcademicPeriod = { startDate: '', endDate: '' }

export const defaultAcademicSettings: AcademicSettings = {
  periods: {
    tertiary: emptyPeriod,
    secondary: emptyPeriod,
  },
  activities: [],
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isAcademicPeriod(value: unknown): value is AcademicPeriod {
  if (!value || typeof value !== 'object') return false
  const period = value as Partial<AcademicPeriod>
  const startValid = period.startDate === '' || isValidDate(period.startDate)
  const endValid = period.endDate === '' || isValidDate(period.endDate)
  return (
    startValid &&
    endValid &&
    (!period.startDate || !period.endDate || period.startDate <= period.endDate)
  )
}

function isActivity(value: unknown): value is AcademicCalendarActivity {
  if (!value || typeof value !== 'object') return false
  const activity = value as Partial<AcademicCalendarActivity> & { date?: unknown }
  const startDate = activity.startDate ?? activity.date
  const endDate = activity.endDate ?? activity.date
  return (
    typeof activity.id === 'string' &&
    typeof activity.title === 'string' &&
    isValidDate(startDate) &&
    isValidDate(endDate) &&
    startDate <= endDate &&
    typeof activity.details === 'string'
  )
}

export function loadAcademicSettings(): AcademicSettings {
  const storedValue = window.localStorage.getItem(storageKey)
  if (!storedValue) return defaultAcademicSettings

  let parsed: unknown
  try {
    parsed = JSON.parse(storedValue)
  } catch {
    throw new Error('Saved academic settings are invalid. Clear the browser storage entry to continue.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Saved academic settings have an unsupported format.')
  }

  const settings = parsed as { periods?: unknown; activities?: unknown }
  if (
    !Array.isArray(settings.activities) ||
    !settings.activities.every(isActivity)
  ) {
    throw new Error('Saved academic settings contain invalid calendar activities.')
  }

  const periods = (settings.periods ?? defaultAcademicSettings.periods) as
    Record<AcademicHierarchyId, unknown>
  if (
    !periods ||
    !isAcademicPeriod(periods.tertiary) ||
    !isAcademicPeriod(periods.secondary)
  ) {
    throw new Error('Saved academic periods contain invalid date ranges.')
  }

  return {
    periods: {
      tertiary: { ...periods.tertiary },
      secondary: { ...periods.secondary },
    },
    activities: settings.activities.map((value) => {
      const activity = value as StoredCalendarActivity
      const legacyDate = activity.date
      return {
        id: activity.id!,
        title: activity.title!,
        startDate: activity.startDate ?? legacyDate as string,
        endDate: activity.endDate ?? legacyDate as string,
        details: activity.details!,
      }
    }),
  }
}

export function saveAcademicSettings(settings: AcademicSettings) {
  window.localStorage.setItem(storageKey, JSON.stringify(settings))
  window.dispatchEvent(new Event('sis-academic-settings-change'))
}
