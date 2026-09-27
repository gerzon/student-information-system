import SisLayout from './SisLayout'
import { SisIcon, type SisIconName } from './SisIcon'
import './DashboardPage.css'

const summaryCards: {
  label: string
  value: string
  detail: string
  icon: SisIconName
  tone: string
}[] = [
  {
    label: 'Total students',
    value: '1,248',
    detail: 'Across all year levels',
    icon: 'students',
    tone: 'blue',
  },
  {
    label: 'Faculty members',
    value: '64',
    detail: 'Teaching and academic staff',
    icon: 'users',
    tone: 'violet',
  },
  {
    label: 'Active programs',
    value: '12',
    detail: 'Currently offered',
    icon: 'courses',
    tone: 'green',
  },
  {
    label: 'Class sections',
    value: '38',
    detail: 'Across all programs',
    icon: 'sections',
    tone: 'amber',
  },
]

const activityItems = [
  {
    initials: 'JD',
    name: 'Juan Dela Cruz',
    detail: 'Student record added',
    time: 'Today, 9:42 AM',
    tone: 'blue',
  },
  {
    initials: 'MS',
    name: 'Maria Santos',
    detail: 'Course enrollment updated',
    time: 'Today, 9:18 AM',
    tone: 'violet',
  },
  {
    initials: 'RA',
    name: 'Registrar Admin',
    detail: 'New section created',
    time: 'Yesterday, 3:36 PM',
    tone: 'green',
  },
]

function DashboardPage() {
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

        <div className="dashboard-sample-note">
          Dashboard preview — the figures and activity below are sample data.
        </div>

        <section className="dashboard-stat-grid" aria-label="Campus summary">
          {summaryCards.map((card) => (
            <article className="dashboard-stat-card" key={card.label}>
              <div className="dashboard-stat-top">
                <span>{card.label}</span>
                <span className={`dashboard-stat-icon is-${card.tone}`}>
                  <SisIcon name={card.icon} />
                </span>
              </div>
              <strong className="dashboard-stat-value">{card.value}</strong>
              <span className="dashboard-stat-detail">{card.detail}</span>
            </article>
          ))}
        </section>

        <div className="dashboard-panels">
          <section className="dashboard-panel enrollment-panel" id="enrollment-overview">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Enrollment overview</h2>
                <p>Student enrollment by month</p>
              </div>
              <span className="dashboard-period">This school year</span>
            </div>
            <div className="enrollment-chart">
              <div className="chart-y-labels" aria-hidden="true">
                <span>1,500</span>
                <span>1,000</span>
                <span>500</span>
                <span>0</span>
              </div>
              <svg
                className="enrollment-chart-svg"
                viewBox="0 0 600 210"
                role="img"
                aria-labelledby="enrollment-chart-title enrollment-chart-description"
                preserveAspectRatio="none"
              >
                <title id="enrollment-chart-title">Enrollment by month</title>
                <desc id="enrollment-chart-description">
                  Sample enrollment rises from 820 in January to 1,248 in June.
                </desc>
                <defs>
                  <linearGradient id="enrollment-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#347bd2" stopOpacity=".2" />
                    <stop offset="100%" stopColor="#347bd2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="chart-grid-line" d="M0 20H600M0 75H600M0 130H600M0 185H600" />
                <path
                  className="chart-area"
                  d="M0 136 C38 132 62 118 100 122 S162 139 200 112 S265 98 300 104 S362 79 400 83 S464 65 500 73 S560 37 600 43 L600 185 L0 185Z"
                />
                <path
                  className="chart-line"
                  d="M0 136 C38 132 62 118 100 122 S162 139 200 112 S265 98 300 104 S362 79 400 83 S464 65 500 73 S560 37 600 43"
                />
                <circle className="chart-point" cx="0" cy="136" r="4" />
                <circle className="chart-point" cx="100" cy="122" r="4" />
                <circle className="chart-point" cx="200" cy="112" r="4" />
                <circle className="chart-point" cx="300" cy="104" r="4" />
                <circle className="chart-point" cx="400" cy="83" r="4" />
                <circle className="chart-point" cx="500" cy="73" r="4" />
                <circle className="chart-point" cx="600" cy="43" r="4" />
              </svg>
              <div className="chart-x-labels" aria-hidden="true">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
            <div className="chart-legend">
              <span />
              Student enrollment
            </div>
          </section>

          <section className="dashboard-panel program-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Students by year level</h2>
                <p>Enrollment distribution</p>
              </div>
              <button type="button" className="dashboard-more-button" aria-label="More year level options">
                <span />
                <span />
                <span />
              </button>
            </div>
            <div className="year-level-content">
              <div className="year-level-donut" role="img" aria-label="Year level distribution shown as a sample chart">
                <div>
                  <strong>1,248</strong>
                  <span>Students</span>
                </div>
              </div>
              <ul className="year-level-legend">
                <li><span className="legend-swatch year-one" />Year 1 <strong>342</strong></li>
                <li><span className="legend-swatch year-two" />Year 2 <strong>318</strong></li>
                <li><span className="legend-swatch year-three" />Year 3 <strong>306</strong></li>
                <li><span className="legend-swatch year-four" />Year 4 <strong>282</strong></li>
              </ul>
            </div>
          </section>

          <section className="dashboard-panel activity-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Recent activity</h2>
                <p>Latest updates across campus</p>
              </div>
              <a href="#reports">View all</a>
            </div>
            <ul className="activity-list">
              {activityItems.map((item) => (
                <li className="activity-item" key={item.name}>
                  <span className={`activity-avatar is-${item.tone}`}>
                    {item.initials}
                  </span>
                  <span className="activity-copy">
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </span>
                  <time>{item.time}</time>
                </li>
              ))}
            </ul>
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
                <span><strong>Enrollment overview</strong><small>Review enrollment trends</small></span>
                <span className="shortcut-arrow">›</span>
              </a>
              <a href="#students">
                <span className="shortcut-icon is-green"><SisIcon name="students" /></span>
                <span><strong>View students</strong><small>Browse student records</small></span>
                <span className="shortcut-arrow">›</span>
              </a>
              <a href="#reports">
                <span className="shortcut-icon is-violet"><SisIcon name="reports" /></span>
                <span><strong>View reports</strong><small>Explore campus summaries</small></span>
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
          Preview only. Connect the student information system database to show live campus data.
        </p>
      </div>
    </SisLayout>
  )
}

export default DashboardPage
