import SisLayout from './SisLayout'
import { SisIcon, type SisIconName } from './SisIcon'
import { formatCreatedAt, getRecentStudents, getStudentInitials } from './adminDashboardUtils'
import { useAdminDashboard } from './useAdminDashboard'
import './AdminConsolePage.css'

const summaryCards: {
  label: string
  value: (studentCount: number, adminCount: number) => string
  detail: string
  icon: SisIconName
  tone: string
}[] = [
  {
    label: 'Student records',
    value: (studentCount) => studentCount.toLocaleString(),
    detail: 'From student records',
    icon: 'students',
    tone: 'blue',
  },
  {
    label: 'Administrator accounts',
    value: (_studentCount, adminCount) => adminCount.toLocaleString(),
    detail: 'Protected accounts',
    icon: 'shield',
    tone: 'violet',
  },
  {
    label: 'Enrollment status',
    value: () => '—',
    detail: 'Not provided by the API',
    icon: 'courses',
    tone: 'green',
  },
  {
    label: 'Records needing review',
    value: () => '—',
    detail: 'Not provided by the API',
    icon: 'reports',
    tone: 'amber',
  },
]

function AdminConsolePage() {
  const { data, error, loading, reload, requiresSignIn } = useAdminDashboard()
  const recentStudents = data ? getRecentStudents(data.recentStudents) : []

  return (
    <SisLayout
      active="Admin Console"
      breadcrumb="Admin Console"
      title="Admin Console"
      subtitle="A clear view of student records and administrator access."
      icon="shield"
    >
      <div className="admin-console">
        <section className="admin-console-banner">
          <div className="admin-console-banner-mark">
            <SisIcon name="shield" />
          </div>
          <div>
            <span className="admin-console-eyebrow">SYSTEM ADMINISTRATION</span>
            <h2>Good day, Admin</h2>
            <p>Manage student information and the people who have access to it.</p>
          </div>
          <span className={`admin-console-preview${data ? ' is-live' : ''}`}>
            <span />
            {loading ? 'Loading API data' : data ? 'Live API data' : 'API data unavailable'}
          </span>
        </section>

        {loading && <p className="admin-console-message" role="status">Loading dashboard data…</p>}
        {requiresSignIn && (
          <p className="admin-console-message" role="status">
            Sign in as an administrator to view live data. <a href="#login">Sign in</a>
          </p>
        )}
        {error && (
          <p className="admin-console-message is-error" role="alert">
            {error}
            {requiresSignIn && <> <a href="#login">Sign in again</a></>}
            {!requiresSignIn && (
              <button type="button" onClick={reload}>Retry</button>
            )}
          </p>
        )}

        <section className="admin-console-stats" aria-label="Administration summary">
          {summaryCards.map((card) => (
            <article className="admin-console-stat" key={card.label}>
              <div className="admin-console-stat-heading">
                <span>{card.label}</span>
                <span className={`admin-console-stat-icon is-${card.tone}`}>
                  <SisIcon name={card.icon} />
                </span>
              </div>
              <strong>
                {data ? card.value(data.studentCount, data.adminCount) : '—'}
              </strong>
              <span className="admin-console-stat-detail">{card.detail}</span>
            </article>
          ))}
        </section>

        <div className="admin-console-columns">
          <section className="admin-console-panel admin-console-students">
            <div className="admin-console-panel-heading">
              <div>
                <span className="admin-console-section-label">STUDENT MANAGEMENT</span>
                <h2>Recently added students</h2>
                <p>Latest student records from the API.</p>
              </div>
              <a className="admin-console-text-link" href="#students">View all students <span aria-hidden="true">→</span></a>
            </div>
            <div className="admin-console-table-wrap">
              <table className="admin-console-table">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Student number</th>
                    <th scope="col">Date added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span className="admin-console-person">
                          <span className="admin-console-avatar is-blue">
                            {getStudentInitials(student)}
                          </span>
                          <span>
                            <strong>{student.firstName} {student.lastName}</strong>
                            <small>{student.email}</small>
                          </span>
                        </span>
                      </td>
                      <td className="admin-console-program">{student.studentNumber}</td>
                      <td>{formatCreatedAt(student.createdAt)}</td>
                    </tr>
                  ))}
                  {recentStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="admin-console-empty">
                        {loading ? 'Loading student records…' : 'No student records to show.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <a className="admin-console-mobile-link" href="#students">Browse student records <span aria-hidden="true">→</span></a>
          </section>

          <section className="admin-console-panel admin-console-access">
            <div className="admin-console-panel-heading">
              <div>
                <span className="admin-console-section-label">ACCESS CONTROL</span>
                <h2>Administrator access</h2>
                <p>People with elevated system access.</p>
              </div>
              <span className="admin-console-access-count">
                {data ? `${data.adminCount.toLocaleString()} accounts` : '— accounts'}
              </span>
            </div>
            <ul className="admin-console-admin-list">
              {data && (
                <li className="admin-console-empty">
                  {data.adminCount === 0
                    ? 'No administrator accounts were found.'
                    : 'Account details are available in Users.'}
                </li>
              )}
              {!data && (
                <li className="admin-console-empty">
                  {loading ? 'Loading administrator accounts…' : 'Sign in to view accounts.'}
                </li>
              )}
            </ul>
            <a className="admin-console-manage-link" href="#users">
              <SisIcon name="users" />
              Manage administrator accounts
              <span aria-hidden="true">→</span>
            </a>
          </section>
        </div>

        <section className="admin-console-quick-actions" aria-label="Quick actions">
          <div>
            <span className="admin-console-section-label">QUICK ACTIONS</span>
            <h2>What would you like to do?</h2>
          </div>
          <a href="#students"><SisIcon name="students" /><span><strong>Browse students</strong><small>Search and review student records</small></span><span className="admin-console-action-arrow" aria-hidden="true">→</span></a>
          <a href="#users"><SisIcon name="users" /><span><strong>Manage administrators</strong><small>Review access and accounts</small></span><span className="admin-console-action-arrow" aria-hidden="true">→</span></a>
        </section>

        <p className="admin-console-footnote">
          Student and administrator records are live from the API. Enrollment status and review
          history are not available from the current API.
        </p>
      </div>
    </SisLayout>
  )
}

export default AdminConsolePage
