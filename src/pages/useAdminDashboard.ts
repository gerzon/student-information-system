import { useEffect, useState } from 'react'
import {
  AdminApiError,
  getAdminDashboard,
  getAdminSession,
  type AdminDashboard,
  type StudentRecord,
} from '../api/adminApi'

type DashboardState = {
  data: AdminDashboard | null
  error: string
  loading: boolean
  requiresSignIn: boolean
}

type DashboardResult = DashboardState & {
  reload: () => void
}

function getInitialState(): DashboardState {
  return getAdminSession()
    ? { data: null, error: '', loading: true, requiresSignIn: false }
    : { data: null, error: '', loading: false, requiresSignIn: true }
}

function isStudentRecord(value: unknown): value is StudentRecord {
  if (typeof value !== 'object' || value === null) return false
  return (
    'id' in value &&
    typeof value.id === 'string' &&
    'studentNumber' in value &&
    typeof value.studentNumber === 'string' &&
    'firstName' in value &&
    typeof value.firstName === 'string' &&
    'lastName' in value &&
    typeof value.lastName === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'enrollmentDate' in value &&
    typeof value.enrollmentDate === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string'
  )
}

function isAdminDashboard(value: unknown): value is AdminDashboard {
  return (
    typeof value === 'object' &&
    value !== null &&
    'studentCount' in value &&
    typeof value.studentCount === 'number' &&
    Number.isInteger(value.studentCount) &&
    value.studentCount >= 0 &&
    'adminCount' in value &&
    typeof value.adminCount === 'number' &&
    Number.isInteger(value.adminCount) &&
    value.adminCount >= 0 &&
    'recentStudents' in value &&
    Array.isArray(value.recentStudents) &&
    value.recentStudents.every(isStudentRecord)
  )
}

export function useAdminDashboard(): DashboardResult {
  const [state, setState] = useState<DashboardState>(getInitialState)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const session = getAdminSession()

    if (!session) {
      return () => controller.abort()
    }

    getAdminDashboard(session.accessToken, controller.signal)
      .then((dashboard) => {
        if (!isAdminDashboard(dashboard)) {
          throw new Error('The API returned data in an unexpected format.')
        }
        setState({
          data: dashboard,
          error: '',
          loading: false,
          requiresSignIn: false,
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const requiresSignIn = error instanceof AdminApiError && error.status === 401
        setState({
          data: null,
          error:
            error instanceof TypeError
              ? 'Could not reach the API. Check that the API is running and try again.'
              : error instanceof Error
                ? error.message
                : 'Could not load dashboard data.',
          loading: false,
          requiresSignIn,
        })
      })

    return () => controller.abort()
  }, [reloadKey])

  return {
    ...state,
    reload: () => {
      setState({ data: null, error: '', loading: true, requiresSignIn: false })
      setReloadKey((key) => key + 1)
    },
  }
}
