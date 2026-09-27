import { secondarySubjects, tertiarySubjects } from './AcademicData'

export type ManagedSubject = {
  id: string
  code: string
  name: string
  units: number
}

export type SubjectClassScope = {
  levelId: string
  courseId: string
  yearName: string
  sectionName: string
}

type SubjectCatalog = Record<string, ManagedSubject[]>

const storageKey = 'sis-managed-subjects-v1'

function getScopeKey(scope: SubjectClassScope) {
  return JSON.stringify([
    scope.levelId,
    scope.courseId,
    scope.yearName,
    scope.sectionName,
  ])
}

function isManagedSubject(value: unknown): value is ManagedSubject {
  if (!value || typeof value !== 'object') return false
  const subject = value as Partial<ManagedSubject>
  return (
    typeof subject.id === 'string' &&
    typeof subject.code === 'string' &&
    typeof subject.name === 'string' &&
    typeof subject.units === 'number' &&
    Number.isFinite(subject.units) &&
    subject.units > 0
  )
}

function readCatalog(): SubjectCatalog {
  const storedValue = window.localStorage.getItem(storageKey)
  if (!storedValue) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(storedValue)
  } catch {
    throw new Error('The saved subject catalog is invalid. Clear the browser storage entry to continue.')
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('The saved subject catalog has an unsupported format.')
  }

  const catalog: SubjectCatalog = {}
  for (const [key, value] of Object.entries(parsed)) {
    if (!Array.isArray(value) || !value.every(isManagedSubject)) {
      throw new Error('The saved subject catalog contains invalid subject records.')
    }
    catalog[key] = value
  }
  return catalog
}

export function getDefaultSubjects(levelId: string): ManagedSubject[] {
  const names = levelId === 'secondary' ? secondarySubjects : tertiarySubjects
  return names.map((name, index) => ({
    id: `default-${levelId}-${index + 1}`,
    code: `SUB-${String(index + 1).padStart(3, '0')}`,
    name,
    units: 3,
  }))
}

export function loadSubjectsForClass(
  scope: SubjectClassScope,
): { subjects: ManagedSubject[]; isCustomized: boolean } {
  const savedSubjects = readCatalog()[getScopeKey(scope)]
  if (savedSubjects) {
    return { subjects: savedSubjects, isCustomized: true }
  }
  return { subjects: getDefaultSubjects(scope.levelId), isCustomized: false }
}

export function saveSubjectsForClass(
  scope: SubjectClassScope,
  subjects: ManagedSubject[],
) {
  const catalog = readCatalog()
  catalog[getScopeKey(scope)] = subjects
  window.localStorage.setItem(storageKey, JSON.stringify(catalog))
}
