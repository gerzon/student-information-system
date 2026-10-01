import type { StudentRecord } from '../api/adminApi'

export function getRecentStudents(students: StudentRecord[], limit = 4): StudentRecord[] {
  return [...students]
    .sort((left, right) => {
      const leftTime = Date.parse(left.createdAt)
      const rightTime = Date.parse(right.createdAt)
      if (!Number.isFinite(leftTime)) return Number.isFinite(rightTime) ? 1 : 0
      if (!Number.isFinite(rightTime)) return -1
      return rightTime - leftTime
    })
    .slice(0, limit)
}

export function getStudentInitials(student: StudentRecord): string {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
}

export function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt)
  if (!Number.isFinite(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
