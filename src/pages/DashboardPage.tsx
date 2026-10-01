import SisLayout from './SisLayout'
import { SisIcon, type SisIconName } from './SisIcon'
import { formatCreatedAt, getRecentStudents, getStudentInitials } from './adminDashboardUtils'
import { useAdminDashboard } from './useAdminDashboard'
import './DashboardPage.css'

const summaryCards: {
  label: string
  icon: SisIconName
  tone: string
  detail: string
  getValue: (studentCount: number, adminCount: number) => string
}[] = [
  {
    label: 'Total students',
    icon: 'students',
    tone: 'blue',
    detail: 'From student records',
    getValue: (studentCount) => studentCount.toLocaleString(),
  },
  {
    label: 'Administrator accounts',
    icon: 'users',
    tone: 'violet',
    detail: 'Protected accounts',
    getValue: (_studentCount, adminCount) => adminCount.toLocaleString(),
  },
  {
    label: 'Active programs',
    icon: 'courses',
    tone: 'green',
    detail: 'Not provided by the API',
    getValue: () => '—',
  },
  {
    label: 'Class sections',
    icon: 'sections',
    tone: 'amber',
    detail: 'Not provided by the API',
    getValue: () => '—',
  },
]

function DashboardPage() {
  const { data, error, loading, reload, requiresSignIn } = useAdminDashboard()
  const recentStudents = data ? getRecentStudents(data.recentStudents, 3) : []

  return (
    <SisLayout
      active="Dashboard"
      breadcrumb="Overview"
      title="Dashboard"
      subtitle="A quick overview of your college information system."
      icon="dashboard"
    >
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">CAMPUS OVERVIEW</span>
            <h2>Good day, Admin</h2>
            <p>Here&apos;s what&apos;s happening at PAPSI College Ormoc.</p>
          </div>
        </div>

        {loading && <p className="dashboard-state" role="status">Loading dashboard data…</p>}
        {requiresSignIn && (
          <p className="dashboard-state" role="status">
            Sign in as an administrator to view live dashboard data. <a href="#login">Sign in</a>
          </p>
        )}
        {error && (
          <p className="dashboard-state is-error" role="alert">
            {error}
            {requiresSignIn && <> <a href="#login">Sign in again</a></>}
            {!requiresSignIn && (
              <button type="button" onClick={reload}>Retry</button>
            )}
          </p>
        )}

        <section className="dashboard-stat-grid" aria-label="Campus summary">
          {summaryCards.map((card) => (
            <article className="dashboard-stat-card" key={card.label}>
              <div className="dashboard-stat-top">
                <span>{card.label}</span>
                <span className={`dashboard-stat-icon is-${card.tone}`}>
                  <SisIcon name={card.icon} />
                </span>
              </div>
              <strong className="dashboard-stat-value">
                {data ? card.getValue(data.studentCount, data.adminCount) : '—'}
              </strong>
              <span className="dashboard-stat-detail">{card.detail}</span>
            </article>
          ))}
        </section>

        <div className="dashboard-panels">
          <section className="dashboard-panel enrollment-panel" id="enrollment-overview">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Enrollment overview</h2>
                <p>Enrollment trend data</p>
              </div>
              <span className="dashboard-period">Unavailable</span>
            </div>
            <p className="dashboard-empty-state">
              The API does not provide enrollment history yet.
            </p>
          </section>

          <section className="dashboard-panel program-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Students by year level</h2>
                <p>Enrollment distribution</p>
              </div>
            </div>
            <p className="dashboard-empty-state">
              Year-level enrollment data is not available from the API.
            </p>
          </section>

          <section className="dashboard-panel activity-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Recently added students</h2>
                <p>Latest student records</p>
              </div>
              <a href="#students">View all</a>
            </div>
            {recentStudents.length > 0 ? (
              <ul className="activity-list">
                {recentStudents.map((student, index) => (
                  <li className="activity-item" key={student.id}>
                    <span className={`activity-avatar is-${['blue', 'violet', 'green'][index % 3]}`}>
                      {getStudentInitials(student)}
                    </span>
                    <span className="activity-copy">
                      <strong>{student.firstName} {student.lastName}</strong>
                      <span>{student.studentNumber}</span>
                    </span>
                    <time dateTime={student.createdAt}>{formatCreatedAt(student.createdAt)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty-state">
                {loading ? 'Loading student records…' : 'No student records to show.'}
              </p>
            )}
          </section>

          <section className="dashboard-panel shortcuts-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Quick actions</h2>
                <p>Common tasks</p>
              </div>
            </div>
            <div className="dashboard-shortcuts">
              <a href="#enrollment-overview">
                <span className="shortcut-icon"><SisIcon name="courses" /></span>
                <span><strong>Enrollment overview</strong><small>Review enrollment data availability</small></span>
                <span className="shortcut-arrow">›</span>
              </a>
              <a href="#students">
                <span className="shortcut-icon is-green"><SisIcon name="students" /></span>
                <span><strong>View students</strong><small>Browse student records</small></span>
                <span className="shortcut-arrow">›</span>
              </a>
              <a href="#admin/console">
                <span className="shortcut-icon is-violet"><SisIcon name="shield" /></span>
                <span><strong>Admin console</strong><small>Review administrators and records</small></span>
                <span className="shortcut-arrow">›</span>
              </a>
              <a href="#users/register">
                <span className="shortcut-icon"><SisIcon name="users" /></span>
                <span><strong>Register faculty or staff</strong><small>Create an employee account</small></span>
                <span className="shortcut-arrow">›</span>
              </a>
            </div>
          </section>
        </div>

        <p className="dashboard-data-caption">
          Student and administrator totals and recently added students come from the API. Program,
          section, and enrollment-history data are not available yet.
        </p>
      </div>
    </SisLayout>
  )
}

export default DashboardPage
