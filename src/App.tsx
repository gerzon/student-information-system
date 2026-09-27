import { useEffect, useState } from 'react'
import {
  CourseHierarchyDirectory,
  SectionsHierarchyDirectory,
} from './pages/AcademicHierarchyPage'
import DashboardPage from './pages/DashboardPage'
import EmployeeDirectory from './pages/EmployeeDirectory'
import EnrollmentPage from './pages/EnrollmentPage'
import FacultyStaffRegistration from './pages/FacultyStaffRegistration'
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

type Page =
  | 'dashboard'
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
  if (hash === '#users') return 'users'
  if (hash === '' || hash === '#login') return 'login'
  return 'dashboard'
}

function App() {
  const [page, setPage] = useState(getCurrentPage)

  useEffect(() => {
    const updatePage = () => setPage(getCurrentPage())
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [])

  if (page === 'register') return <User_Student_Registration />
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
  if (page === 'employee-registration') return <FacultyStaffRegistration />
  if (page === 'users') return <EmployeeDirectory />
  if (page === 'dashboard') return <DashboardPage />
  return <LoginPage />
}

export default App
