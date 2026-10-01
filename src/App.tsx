import { useEffect, useState } from 'react'
import {
  ADMIN_SESSION_CHANGED_EVENT,
  clearAdminSession,
  clearPortalSession,
  getAdminSession,
  getPortalSession,
  PORTAL_SESSION_CHANGED_EVENT,
  type AdminSession,
  type PortalSession,
} from './api/adminApi'
import {
  CourseHierarchyDirectory,
  SectionsHierarchyDirectory,
} from './pages/AcademicHierarchyPage'
import DashboardPage from './pages/DashboardPage'
import AdminConsolePage from './pages/AdminConsolePage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminPortalUsersPage from './pages/AdminPortalUsersPage'
import AdminReferenceManagementPage from './pages/AdminReferenceManagementPage'
import EmployeeDirectory from './pages/EmployeeDirectory'
import EnrollmentPage from './pages/EnrollmentPage'
import GradesPage from './pages/GradesPage'
import LoginPage from './pages/LoginPage'
import MyExamsPage from './pages/MyExamsPage'
import MyAttendancePage from './pages/MyAttendancePage'
import MyGradesPage from './pages/MyGradesPage'
import MySchedulePage from './pages/MySchedulePage'
import QRAttendancePage from './pages/QRAttendancePage'
import ClassSchedulePage from './pages/ClassSchedulePage'
import StudentExamSession from './pages/StudentExamSession'
import StudentsExamPage from './pages/StudentsExamPage'
import StudentDirectory from './pages/StudentDirectory'
import SubjectManagementPage from './pages/SubjectManagementPage'
import SettingsPage from './pages/SettingsPage'
import User_Student_Registration from './pages/User_Student_Registration'
import {
  PortalDashboardPage,
  PortalFeaturePage,
  PortalLandingPage,
} from './pages/PortalPages'

type Page =
  | 'landing'
  | 'dashboard'
  | 'student-dashboard'
  | 'student-profile'
  | 'student-enrollment'
  | 'student-subjects'
  | 'student-announcements'
  | 'faculty-dashboard'
  | 'faculty-students'
  | 'faculty-classes'
  | 'faculty-attendance'
  | 'faculty-grades'
  | 'faculty-schedule'
  | 'faculty-exam-management'
  | 'faculty-reports'
  | 'admin-faculty-staff'
  | 'admin-console'
  | 'admin-users'
  | 'admin-portal-users'
  | 'admin-positions'
  | 'admin-designations'
  | 'courses'
  | 'class-schedule'
  | 'employee-registration'
  | 'enrollments'
  | 'grades'
  | 'login'
  | 'my-exams'
  | 'my-attendance'
  | 'my-grades'
  | 'my-schedule'
  | 'qr-attendance'
  | 'register'
  | 'sections'
  | 'settings'
  | 'students-exam'
  | 'students'
  | 'subjects'
  | 'exam-session'
  | 'users'

function getCurrentPage(): Page {
  const hash = window.location.hash
    .replace(/%20/gi, ' ')
    .replace(/%27/gi, "'")
    .toLowerCase()
  if (hash === '#register') return 'register'
  if (hash === '#student/dashboard') return 'student-dashboard'
  if (hash === '#student/profile') return 'student-profile'
  if (hash === '#student/enrollment') return 'student-enrollment'
  if (hash === '#student/subjects') return 'student-subjects'
  if (hash === '#student/announcements') return 'student-announcements'
  if (hash === '#faculty/dashboard') return 'faculty-dashboard'
  if (hash === '#faculty/students') return 'faculty-students'
  if (hash === '#faculty/classes') return 'faculty-classes'
  if (hash === '#faculty/attendance') return 'faculty-attendance'
  if (hash === '#faculty/grades') return 'faculty-grades'
  if (hash === '#faculty/schedule') return 'faculty-schedule'
  if (hash === '#faculty/exam-management') return 'faculty-exam-management'
  if (hash === '#faculty/reports') return 'faculty-reports'
  if (hash === '#admin/faculty-staff') return 'admin-faculty-staff'
  if (hash === '#admin/console') return 'admin-console'
  if (hash === '#admin/portal-users') return 'admin-portal-users'
  if (hash === '#admin/positions') return 'admin-positions'
  if (hash === '#admin/designations') return 'admin-designations'
  if (hash === '#students') return 'students'
  if (hash === '#enrollments') return 'enrollments'
  if (hash === '#courses') return 'courses'
  if (hash === '#class-schedule' || hash === '#class schedule') return 'class-schedule'
  if (hash === '#sections') return 'sections'
  if (hash === '#subjects') return 'subjects'
  if (hash === '#settings') return 'settings'
  if (hash === '#grades') return 'grades'
  if (hash === '#qr attendance' || hash === '#qr-attendance') return 'qr-attendance'
  if (hash === "#student's exam" || hash === '#students-exam') return 'students-exam'
  if (hash === '#my exams' || hash === '#my-exams') return 'my-exams'
  if (hash === '#my attendance' || hash === '#my-attendance') return 'my-attendance'
  if (hash === '#my grades' || hash === '#my-grades') return 'my-grades'
  if (hash === '#my schedule' || hash === '#my-schedule') return 'my-schedule'
  if (window.location.hash.startsWith('#exam-session/')) return 'exam-session'
  if (hash === '#users/register') return 'employee-registration'
  if (hash === '#users') return 'admin-users'
  if (hash === '#landing') return 'landing'
  if (hash === '#login') return 'login'
  if (hash === '') return 'landing'
  return 'dashboard'
}

function isAdminPage(page: Page): boolean {
  return [
    'dashboard',
    'admin-console',
    'admin-users',
    'admin-portal-users',
    'admin-positions',
    'admin-designations',
    'admin-faculty-staff',
    'courses',
    'class-schedule',
    'employee-registration',
    'enrollments',
    'grades',
    'qr-attendance',
    'sections',
    'settings',
    'students',
    'students-exam',
    'subjects',
    'users',
  ].includes(page)
}

function getPortalHomeHash(role: PortalSession['role']): string {
  if (role === 'Student') return '#student/dashboard'
  return '#faculty/dashboard'
}

function getPortalPageRole(page: Page): PortalSession['role'] | null {
  if (page.startsWith('student-') || page === 'my-exams' || page === 'my-attendance' ||
      page === 'my-grades' || page === 'my-schedule') {
    return 'Student'
  }
  if (page.startsWith('faculty-')) return 'Faculty'
  return null
}

function replaceHash(hash: string): void {
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${hash}`,
  )
}

function resolveCurrentPage(): Page {
  const page = getCurrentPage()
  const hasValidSession = getAdminSession() !== null
  const portalSession = getPortalSession()

  if (page === 'login' && hasValidSession) {
    replaceHash('#dashboard')
    return 'dashboard'
  }

  if (page === 'login' && portalSession) {
    replaceHash(getPortalHomeHash(portalSession.role))
    return getCurrentPage()
  }

  if (isAdminPage(page) && !hasValidSession) {
    replaceHash('#login')
    return 'login'
  }

  const requiredPortalRole = getPortalPageRole(page)
  if (requiredPortalRole) {
    if (!portalSession) {
      replaceHash('#login')
      return 'login'
    }
    if (portalSession.role !== requiredPortalRole &&
        !(portalSession.role === 'Staff' && requiredPortalRole === 'Faculty') &&
        !(portalSession.role === 'User' && requiredPortalRole === 'Faculty')) {
      replaceHash(getPortalHomeHash(portalSession.role))
      return getCurrentPage()
    }
  }

  return page
}

function App() {
  const [page, setPage] = useState(resolveCurrentPage)
  const [session, setSession] = useState<AdminSession | null>(getAdminSession)
  const [portalSession, setPortalSession] = useState<PortalSession | null>(getPortalSession)

  useEffect(() => {
    const updatePage = () => setPage(resolveCurrentPage())
    const updateSession = () => {
      setSession(getAdminSession())
      setPortalSession(getPortalSession())
      updatePage()
    }
    window.addEventListener('hashchange', updatePage)
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, updateSession)
    window.addEventListener(PORTAL_SESSION_CHANGED_EVENT, updateSession)
    return () => {
      window.removeEventListener('hashchange', updatePage)
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, updateSession)
      window.removeEventListener(PORTAL_SESSION_CHANGED_EVENT, updateSession)
    }
  }, [])

  useEffect(() => {
    if (!session) return

    const expireSession = () => {
      const activeSession = getAdminSession()
      if (activeSession) {
        setSession(activeSession)
        return
      }

      replaceHash('#login')
      clearAdminSession()
      setSession(null)
      setPage('login')
    }
    const timeout = window.setTimeout(
      expireSession,
      Math.max(0, Date.parse(session.expiresAt) - Date.now()),
    )
    return () => window.clearTimeout(timeout)
  }, [session])

  useEffect(() => {
    if (!portalSession) return
    const timeout = window.setTimeout(() => {
      const activeSession = getPortalSession()
      if (activeSession) {
        setPortalSession(activeSession)
        return
      }
      clearPortalSession()
      replaceHash('#login')
      setPage('login')
    }, Math.max(0, Date.parse(portalSession.expiresAt) - Date.now()))
    return () => window.clearTimeout(timeout)
  }, [portalSession])

  if (page === 'register') return <User_Student_Registration />
  if (page === 'landing') return <PortalLandingPage />
  if (page === 'student-dashboard') return <PortalDashboardPage portal="student" />
  if (page === 'student-profile') return <PortalFeaturePage portal="student" feature="profile" />
  if (page === 'student-enrollment') return <PortalFeaturePage portal="student" feature="enrollment" />
  if (page === 'student-subjects') return <PortalFeaturePage portal="student" feature="subjects" />
  if (page === 'student-announcements') return <PortalFeaturePage portal="student" feature="announcements" />
  if (page === 'faculty-dashboard') return <PortalDashboardPage portal="faculty" />
  if (page === 'faculty-students') return <StudentDirectory role="faculty" />
  if (page === 'faculty-classes') return <PortalFeaturePage portal="faculty" feature="classes" />
  if (page === 'faculty-attendance') return <QRAttendancePage role="faculty" />
  if (page === 'faculty-grades') return <GradesPage role="faculty" />
  if (page === 'faculty-schedule') return <ClassSchedulePage role="faculty" activeLabel="Schedule" />
  if (page === 'faculty-exam-management') return <StudentsExamPage role="faculty" activeLabel="Exam Management" />
  if (page === 'faculty-reports') return <PortalFeaturePage portal="faculty" feature="reports" />
  if (page === 'admin-faculty-staff') return <EmployeeDirectory />
  if (page === 'admin-console') return <AdminConsolePage />
  if (page === 'admin-users') return <AdminUsersPage />
  if (page === 'admin-portal-users') return <AdminPortalUsersPage />
  if (page === 'admin-positions') return <AdminReferenceManagementPage type="positions" />
  if (page === 'admin-designations') return <AdminReferenceManagementPage type="designations" />
  if (page === 'students') return <StudentDirectory />
  if (page === 'enrollments') return <EnrollmentPage />
  if (page === 'courses') return <CourseHierarchyDirectory />
  if (page === 'class-schedule') return <ClassSchedulePage />
  if (page === 'sections') return <SectionsHierarchyDirectory />
  if (page === 'subjects') return <SubjectManagementPage />
  if (page === 'settings') return <SettingsPage />
  if (page === 'grades') return <GradesPage />
  if (page === 'qr-attendance') return <QRAttendancePage />
  if (page === 'students-exam') return <StudentsExamPage />
  if (page === 'my-exams') return <MyExamsPage />
  if (page === 'my-attendance') return <MyAttendancePage />
  if (page === 'my-grades') return <MyGradesPage />
  if (page === 'my-schedule') return <MySchedulePage />
  if (page === 'exam-session') {
    const code = decodeURIComponent(window.location.hash.slice('#exam-session/'.length))
    return <StudentExamSession code={code} />
  }
  if (page === 'employee-registration') return <AdminPortalUsersPage />
  if (page === 'users') return <EmployeeDirectory />
  if (page === 'dashboard') return <DashboardPage />
  return <LoginPage />
}

export default App
