import { useMemo, useState, type FormEvent } from 'react'
import SisLayout, { type SisPortalRole } from './SisLayout'
import { SisIcon, type SisIconName } from './SisIcon'
import './PortalPages.css'

const portalNames: Record<SisPortalRole, string> = {
  student: 'Student Portal',
  faculty: 'Faculty/Staff Portal',
  admin: 'Admin Portal',
}

const portalDashboards: Record<SisPortalRole, {
  subtitle: string
  metrics: { label: string; value: string; icon: SisIconName }[]
  links: { label: string; detail: string; href: string; icon: SisIconName }[]
}> = {
  student: {
    subtitle: 'Your classes, academic progress, and campus updates in one place.',
    metrics: [
      { label: 'Enrolled subjects', value: '6', icon: 'courses' },
      { label: 'Current average', value: '89%', icon: 'grades' },
      { label: 'Classes this week', value: '18', icon: 'calendar' },
    ],
    links: [
      { label: 'My Profile', detail: 'Review your student information.', href: '#student/profile', icon: 'user' },
      { label: 'Enrollment', detail: 'View your current enrollment status.', href: '#student/enrollment', icon: 'students' },
      { label: 'Subjects', detail: 'See your current subject load.', href: '#student/subjects', icon: 'courses' },
      { label: 'Grades', detail: 'Check your academic progress.', href: '#my%20grades', icon: 'grades' },
      { label: 'Schedule', detail: 'Review your weekly timetable.', href: '#my%20schedule', icon: 'calendar' },
      { label: 'Announcements', detail: 'Read the latest campus updates.', href: '#student/announcements', icon: 'reports' },
    ],
  },
  faculty: {
    subtitle: 'Manage your classes and keep up with your teaching responsibilities.',
    metrics: [
      { label: 'Assigned classes', value: '4', icon: 'sections' },
      { label: 'Students', value: '126', icon: 'students' },
      { label: 'Pending grades', value: '12', icon: 'grades' },
    ],
    links: [
      { label: 'Students', detail: 'Browse the student directory.', href: '#faculty/students', icon: 'students' },
      { label: 'Classes', detail: 'Review your class assignments.', href: '#faculty/classes', icon: 'sections' },
      { label: 'Attendance', detail: 'View class attendance records.', href: '#faculty/attendance', icon: 'qrcodeattendance' },
      { label: 'Grades', detail: 'Enter and review student grades.', href: '#faculty/grades', icon: 'grades' },
      { label: 'Schedule', detail: 'Check your weekly schedule.', href: '#faculty/schedule', icon: 'calendar' },
      { label: 'Reports', detail: 'Review teaching and class summaries.', href: '#faculty/reports', icon: 'reports' },
    ],
  },
  admin: {
    subtitle: 'A quick overview of your college information system.',
    metrics: [
      { label: 'Students', value: '1,248', icon: 'students' },
      { label: 'Faculty & staff', value: '64', icon: 'users' },
      { label: 'Programs', value: '12', icon: 'courses' },
    ],
    links: [
      { label: 'Users', detail: 'Manage user accounts.', href: '#users', icon: 'users' },
      { label: 'Students', detail: 'Browse student records.', href: '#students', icon: 'students' },
      { label: 'Faculty/Staff', detail: 'Manage faculty and staff records.', href: '#admin/faculty-staff', icon: 'users' },
      { label: 'Programs', detail: 'Browse academic programs.', href: '#courses', icon: 'courses' },
      { label: 'Subjects', detail: 'Manage course subject loads.', href: '#subjects', icon: 'courses' },
      { label: 'Sections', detail: 'Browse academic sections.', href: '#sections', icon: 'sections' },
      { label: 'Scheduling', detail: 'Plan class schedules.', href: '#class-schedule', icon: 'calendar' },
      { label: 'Enrollment', detail: 'Review enrollment requests.', href: '#enrollments', icon: 'students' },
      { label: 'System Settings', detail: 'Manage academic settings.', href: '#settings', icon: 'settings' },
    ],
  },
}

export function PortalLandingPage() {
  const portals: SisPortalRole[] = ['student', 'faculty', 'admin']
  return (
    <main className="portal-landing">
      <header className="portal-landing-header">
        <a className="portal-landing-brand" href="#landing">
          <img src="/papsi_logo%20(2).png" alt="" />
          <span><strong>PAPSI College Ormoc</strong><small>Student Information System</small></span>
        </a>
        <a className="portal-login-link" href="#login">Sign in</a>
      </header>
      <section className="portal-landing-hero">
        <span className="portal-eyebrow">PAPSI COLLEGE ORMOC</span>
        <h1>One campus.<br /><span>One connected community.</span></h1>
        <p>Find the tools and information you need for your academic journey, teaching, or campus administration.</p>
      </section>
      <section className="portal-choice-section" aria-labelledby="portal-choice-title">
        <div className="portal-section-heading">
          <div><span className="portal-eyebrow">STUDENT INFORMATION SYSTEM</span><h2 id="portal-choice-title">Choose your portal</h2></div>
          <span className="portal-preview-label">Interactive UI preview</span>
        </div>
        <div className="portal-choice-grid">
          {portals.map((portal) => {
            const icon: SisIconName = portal === 'student' ? 'cap' : portal === 'faculty' ? 'users' : 'shield'
            const href = portal === 'admin' ? '#dashboard' : `#${portal}/dashboard`
            const description = portal === 'student'
              ? 'Check your enrollment, subjects, grades, schedule, and campus news.'
              : portal === 'faculty'
                ? 'Access your students, classes, attendance, grades, and reports.'
                : 'Oversee users, academic records, programs, and system settings.'
            return (
              <article className="portal-choice-card" key={portal}>
                <span className={`portal-choice-icon is-${portal}`}><SisIcon name={icon} /></span>
                <h3>{portalNames[portal]}</h3>
                <p>{description}</p>
                <a href={href}>Enter {portal === 'faculty' ? 'faculty/staff' : portal} portal <span aria-hidden="true">→</span></a>
              </article>
            )
          })}
        </div>
        <p className="portal-preview-note">Portal links open sample screens. Sign-in and records are not connected to an authentication or student information service.</p>
      </section>
      <footer className="portal-landing-footer">© {new Date().getFullYear()} PAPSI College Ormoc · Student Information System</footer>
    </main>
  )
}

export function PortalDashboardPage({ portal }: { portal: 'student' | 'faculty' }) {
  const content = portalDashboards[portal]
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const isStudent = portal === 'student'
  const metrics = isStudent
    ? [
        { label: 'My courses', value: '6', detail: 'Subjects this semester', icon: 'courses' as const, tone: 'blue' },
        { label: 'Class schedule', value: '10:00 AM', detail: 'Next: Intro to Psychology', icon: 'calendar' as const, tone: 'teal' },
        { label: 'Latest grades', value: '3.75', detail: 'Overall GPA', icon: 'grades' as const, tone: 'amber' },
        { label: 'Account balance', value: 'P2,500', detail: 'Outstanding balance', icon: 'reports' as const, tone: 'violet' },
      ]
    : [
        { label: 'My classes', value: '4', detail: 'Assigned this semester', icon: 'sections' as const, tone: 'blue' },
        { label: 'Students', value: '126', detail: 'Across all classes', icon: 'students' as const, tone: 'teal' },
        { label: 'Attendance rate', value: '96%', detail: 'Class average', icon: 'qrcodeattendance' as const, tone: 'green' },
        { label: 'Grades to submit', value: '12', detail: 'Awaiting completion', icon: 'grades' as const, tone: 'amber' },
      ]
  const tasks = isStudent
    ? ['Submit research paper', 'Review class schedule', 'Prepare for Intro to Psychology']
    : ['Submit BSIT 2-A attendance', 'Complete midterm grades', 'Review class announcements']
  const completedCount = completedTasks.length
  const events = isStudent
    ? [
        { month: 'OCT', day: '26', title: 'Campus Orientation', detail: '2:00 PM · Main Auditorium', tag: 'Campus' },
        { month: 'OCT', day: '30', title: 'Exam: Intro to Psychology', detail: '10:00 AM · Room 203', tag: 'Academic' },
        { month: 'NOV', day: '04', title: 'Tuition payment deadline', detail: 'Online and cashier payments', tag: 'Reminder' },
      ]
    : [
        { month: 'TODAY', day: '10', title: 'BSIT 2-A · Web Development', detail: '10:00 AM · Computer Lab 1', tag: 'Upcoming' },
        { month: 'TODAY', day: '1', title: 'BSIT 3-A · Database Systems', detail: '1:00 PM · Room 204', tag: 'Class' },
        { month: 'OCT', day: '30', title: 'Midterm grade submission', detail: 'Submit grades by end of day', tag: 'Reminder' },
      ]
  const breakdown = isStudent
    ? [['A', '46%', 'blue'], ['B', '32%', 'teal'], ['C', '19%', 'violet'], ['D', '6%', 'amber']]
    : [['Present', '82%', 'blue'], ['Late', '10%', 'amber'], ['Absent', '8%', 'violet']]

  return (
    <SisLayout
      role={portal}
      active="Dashboard"
      breadcrumb="Dashboard"
      title={`${isStudent ? 'Welcome, John!' : 'Welcome, Faculty!'}`}
      subtitle={content.subtitle}
      icon="dashboard"
    >
      <div className={`portal-dashboard is-${portal}`}>
        <section className="portal-dashboard-hero" aria-label="Welcome">
          <div className="portal-dashboard-hero-copy">
            <span>{portalNames[portal]}</span>
            <h2>{isStudent ? 'Welcome, John!' : 'Welcome, Faculty!'}</h2>
            <p>{isStudent ? "Here's your student portal dashboard." : "Here's your faculty and staff dashboard."}</p>
          </div>
          <img className="portal-campus-illustration" src="/campus-banner.svg" alt="" />
        </section>
        <section className="portal-dashboard-body">
          <p className="portal-dashboard-sample-note"><strong>Dashboard preview:</strong> figures and records shown here are sample data.</p>
          <section className="portal-dashboard-metrics" aria-label={`${portalNames[portal]} summary`}>
            {metrics.map((metric) => (
              <article className="portal-overview-card" key={metric.label}>
                <div className="portal-overview-card-heading">
                  <strong>{metric.label}</strong>
                  <span className={`portal-overview-icon is-${metric.tone}`}><SisIcon name={metric.icon} /></span>
                </div>
                <strong className="portal-overview-value">{metric.value}</strong>
                <span className="portal-overview-detail">{metric.detail}</span>
              </article>
            ))}
          </section>
          <div className="portal-dashboard-panels">
            <div className="portal-dashboard-main-column">
              <section className="portal-dashboard-panel" aria-labelledby="portal-events-heading">
                <div className="portal-dashboard-panel-heading">
                  <div><h2 id="portal-events-heading">{isStudent ? 'Upcoming events' : 'Upcoming classes'}</h2><p>{isStudent ? 'Important dates and campus activities' : 'Your next sessions and faculty activities'}</p></div>
                  <a href={isStudent ? '#student/announcements' : '#faculty/schedule'}>View all <span aria-hidden="true">›</span></a>
                </div>
                <div className="portal-event-list">
                  {events.map((event) => (
                    <article className="portal-event-item" key={event.title}>
                      <div className="portal-event-date"><small>{event.month}</small><strong>{event.day}</strong></div>
                      <div className="portal-event-copy"><strong>{event.title}</strong><span>{event.detail}</span></div>
                      <span className="portal-event-tag">{event.tag}</span>
                    </article>
                  ))}
                </div>
              </section>
              <section className="portal-dashboard-panel portal-task-panel" aria-labelledby="portal-tasks-heading">
                <div className="portal-dashboard-panel-heading">
                  <div><h2 id="portal-tasks-heading">To-do list</h2><p>{completedCount} of {tasks.length} tasks completed</p></div>
                  <span className="portal-task-progress">{Math.round((completedCount / tasks.length) * 100)}% done</span>
                </div>
                <div className="portal-task-list">
                  {tasks.map((task, index) => (
                    <label className="portal-task-item" key={task}>
                      <input
                        type="checkbox"
                        checked={completedTasks.includes(task)}
                        onChange={() => setCompletedTasks((current) =>
                          current.includes(task)
                            ? current.filter((item) => item !== task)
                            : [...current, task],
                        )}
                      />
                      <span className="portal-task-icon"><SisIcon name={index === 0 ? 'reports' : index === 1 ? 'calendar' : 'courses'} /></span>
                      <span className="portal-task-name">{task}</span>
                      <small>{index === 0 ? 'Today' : index === 1 ? 'This week' : 'Upcoming'}</small>
                    </label>
                  ))}
                </div>
              </section>
            </div>
            <section className="portal-dashboard-panel portal-distribution-panel" aria-labelledby="portal-distribution-heading">
              <div className="portal-dashboard-panel-heading">
                <div><h2 id="portal-distribution-heading">{isStudent ? 'Grade distribution' : 'Class attendance'}</h2><p>{isStudent ? 'Breakdown of your grades this semester' : 'Attendance summary across your classes'}</p></div>
                <span className="portal-chart-menu" aria-hidden="true">···</span>
              </div>
              <div className={`portal-donut-chart is-${portal}`} role="img" aria-label={isStudent ? 'Grade distribution: A 46%, B 32%, C 19%, D 6%' : 'Attendance: present 82%, late 10%, absent 8%'}>
                <span>{isStudent ? '3.75' : '96%'}<small>{isStudent ? 'GPA' : 'Present'}</small></span>
              </div>
              <ul className="portal-chart-legend">
                {breakdown.map(([label, value, tone]) => (
                  <li key={label}><span className={`portal-chart-dot is-${tone}`} /><strong>{label}</strong><span className="portal-chart-track"><i style={{ width: value }} /></span><small>{value}</small></li>
                ))}
              </ul>
            </section>
          </div>
        </section>
        <section className="portal-dashboard-links" aria-labelledby="portal-quick-links-title">
          <div className="portal-section-heading"><div><span className="portal-eyebrow">QUICK ACCESS</span><h2 id="portal-quick-links-title">{isStudent ? 'Student services' : 'Faculty workspace'}</h2></div></div>
          <div className="portal-feature-grid">
            {content.links.map((link) => (
              <a className="portal-feature-card" href={link.href} key={link.label}>
                <span><SisIcon name={link.icon} /></span><div><strong>{link.label}</strong><small>{link.detail}</small></div><b aria-hidden="true">›</b>
              </a>
            ))}
          </div>
        </section>
      </div>
    </SisLayout>
  )
}

type StudentFeature = 'profile' | 'enrollment' | 'subjects' | 'announcements'
type FacultyFeature = 'classes' | 'reports'
type AdminFeature = 'users'
type PortalFeature = StudentFeature | FacultyFeature | AdminFeature
type EnrollmentRequest = { id: number; term: string; status: 'Pending' | 'Approved'; submitted: string }

const announcements = [
  { category: 'Academic', date: 'September 24, 2026', title: 'Enrollment confirmation for the next term', body: 'Please review your enrollment details and confirm your subject load before the registration deadline.' },
  { category: 'Campus', date: 'September 20, 2026', title: 'Library hours updated', body: 'The campus library will be open from 8:00 AM to 6:00 PM on weekdays.' },
  { category: 'Events', date: 'September 16, 2026', title: 'College community week', body: 'Students, faculty, and staff are invited to join the upcoming campus activities.' },
]

const subjects = [
  { code: 'IT 204', name: 'Web Development', units: 3, instructor: 'J. Ramos' },
  { code: 'IT 206', name: 'Database Systems', units: 3, instructor: 'M. Santos' },
  { code: 'IT 205', name: 'Object-Oriented Programming', units: 3, instructor: 'R. Villanueva' },
  { code: 'GE 4', name: 'Purposive Communication', units: 3, instructor: 'A. Dela Cruz' },
  { code: 'PE 4', name: 'Physical Education 4', units: 2, instructor: 'C. Garcia' },
  { code: 'IT 208', name: 'Information Assurance and Security', units: 3, instructor: 'P. Reyes' },
]

export function PortalFeaturePage({
  portal,
  feature,
}: {
  portal: SisPortalRole
  feature: PortalFeature
}) {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([
    { id: 1, term: 'First Semester · AY 2026–2027', status: 'Approved', submitted: 'August 12, 2026' },
  ])
  const [announcementFilter, setAnnouncementFilter] = useState('All')
  const [subjectSearch, setSubjectSearch] = useState('')
  const visibleAnnouncements = announcements.filter((item) =>
    announcementFilter === 'All' || item.category === announcementFilter,
  )
  const visibleSubjects = useMemo(() => subjects.filter((subject) =>
    `${subject.code} ${subject.name} ${subject.instructor}`.toLowerCase().includes(subjectSearch.toLowerCase()),
  ), [subjectSearch])

  const titles: Record<PortalFeature, { title: string; subtitle: string; icon: SisIconName }> = {
    profile: { title: 'My Profile', subtitle: 'Review your student contact and academic information.', icon: 'user' },
    enrollment: { title: 'Enrollment', subtitle: 'Review your enrollment status and current academic term.', icon: 'students' },
    subjects: { title: 'My Subjects', subtitle: 'Browse subjects in your current academic load.', icon: 'courses' },
    announcements: { title: 'Announcements', subtitle: 'The latest updates from PAPSI College Ormoc.', icon: 'reports' },
    classes: { title: 'My Classes', subtitle: 'Review the classes assigned to your faculty account.', icon: 'sections' },
    reports: { title: 'Reports', subtitle: 'A snapshot of your classes and academic activity.', icon: 'reports' },
    users: { title: 'Users', subtitle: 'Review SIS accounts and their current access status.', icon: 'users' },
  }
  const page = titles[feature]
  const active = feature === 'profile' ? 'My Profile' : feature === 'enrollment' ? 'Enrollment' : feature === 'subjects' ? 'Subjects' : feature === 'announcements' ? 'Announcements' : feature === 'classes' ? 'Classes' : feature === 'users' ? 'Users' : 'Reports'

  function submitEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const term = String(form.get('term'))
    setRequests((current) => [
      { id: Date.now(), term, status: 'Pending', submitted: new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date()) },
      ...current,
    ])
    event.currentTarget.reset()
  }

  function exportReport() {
    const rows = [
      ['Report', 'Value'],
      ['Assigned classes', '4'],
      ['Students', '126'],
      ['Pending grades', '12'],
      ['Attendance submitted this week', '18'],
    ]
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const objectUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const downloadLink = document.createElement('a')
    downloadLink.href = objectUrl
    downloadLink.download = 'faculty-summary-report.csv'
    downloadLink.click()
    URL.revokeObjectURL(objectUrl)
  }

  return (
    <SisLayout role={portal} active={active} breadcrumb={page.title} breadcrumbRoot={portalNames[portal]} breadcrumbHref={`#${portal}/dashboard`} title={page.title} subtitle={page.subtitle} icon={page.icon}>
      <div className="portal-feature-page">
        <div className="portal-preview-banner"><strong>Sample data:</strong> this screen is a UI preview and is not connected to live school records.</div>
        {feature === 'profile' && (
          <section className="portal-info-panel" aria-labelledby="student-profile-heading">
            <div className="portal-profile-heading"><span className="portal-profile-avatar">JD</span><div><h2 id="student-profile-heading">Juan Dela Cruz</h2><p>Student · 2024-2A001</p></div></div>
            <dl className="portal-profile-grid">
              <div><dt>Program</dt><dd>Bachelor of Science in Information Technology</dd></div>
              <div><dt>Year level & section</dt><dd>Year 2 · BSIT 2-A</dd></div>
              <div><dt>Email</dt><dd>juan.delacruz@example.edu</dd></div>
              <div><dt>Academic standing</dt><dd>Currently enrolled</dd></div>
            </dl>
          </section>
        )}
        {feature === 'enrollment' && (
          <div className="portal-content-columns">
            <section className="portal-info-panel" aria-labelledby="enrollment-history-heading">
              <h2 id="enrollment-history-heading">Enrollment history</h2>
              <div className="portal-request-list">{requests.map((request) => (
                <article className="portal-request-card" key={request.id}>
                  <div><strong>{request.term}</strong><small>Submitted {request.submitted}</small></div>
                  <span className={`portal-status is-${request.status.toLowerCase()}`}>{request.status}</span>
                </article>
              ))}</div>
            </section>
            <section className="portal-info-panel" aria-labelledby="enrollment-request-heading">
              <h2 id="enrollment-request-heading">Request enrollment</h2>
              <p>Select an upcoming term to submit a sample request.</p>
              <form className="portal-enrollment-form" onSubmit={submitEnrollment}>
                <label htmlFor="student-enrollment-term">Academic term</label>
                <select id="student-enrollment-term" name="term" required defaultValue="">
                  <option value="" disabled>Select a term</option>
                  <option>Second Semester · AY 2026–2027</option>
                  <option>Summer Term · AY 2026–2027</option>
                </select>
                <button type="submit" className="portal-primary-button">Submit request</button>
              </form>
            </section>
          </div>
        )}
        {feature === 'subjects' && (
          <section className="portal-info-panel" aria-labelledby="subject-load-heading">
            <div className="portal-panel-heading"><div><h2 id="subject-load-heading">Current subject load</h2><p>First Semester · AY 2026–2027 · BSIT 2-A</p></div><label className="portal-search">Search<input value={subjectSearch} onChange={(event) => setSubjectSearch(event.currentTarget.value)} placeholder="Code or subject name" /></label></div>
            <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Course code</th><th>Subject</th><th>Instructor</th><th>Units</th></tr></thead><tbody>{visibleSubjects.map((subject) => <tr key={subject.code}><td>{subject.code}</td><td>{subject.name}</td><td>{subject.instructor}</td><td>{subject.units}</td></tr>)}</tbody></table></div>
            {!visibleSubjects.length && <p className="portal-empty-state">No subjects match your search.</p>}
          </section>
        )}
        {feature === 'announcements' && (
          <section className="portal-info-panel" aria-labelledby="announcement-list-heading">
            <div className="portal-panel-heading"><div><h2 id="announcement-list-heading">Campus updates</h2><p>Stay informed about academic dates and college events.</p></div><label className="portal-filter">Category<select value={announcementFilter} onChange={(event) => setAnnouncementFilter(event.currentTarget.value)}><option>All</option><option>Academic</option><option>Campus</option><option>Events</option></select></label></div>
            <div className="portal-announcement-list">{visibleAnnouncements.map((item) => <article className="portal-announcement-card" key={item.title}><div><span className="portal-announcement-category">{item.category}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
          </section>
        )}
        {feature === 'classes' && (
          <section className="portal-info-panel" aria-labelledby="faculty-classes-heading">
            <div className="portal-panel-heading"><div><h2 id="faculty-classes-heading">Assigned classes</h2><p>First Semester · AY 2026–2027</p></div></div>
            <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Class</th><th>Subject</th><th>Schedule</th><th>Students</th><th>Room</th></tr></thead><tbody>
              <tr><td>BSIT 2-A</td><td>Web Development</td><td>Mon / Wed · 7:30 AM</td><td>32</td><td>Lab 1</td></tr>
              <tr><td>BSIT 2-B</td><td>Web Development</td><td>Tue / Thu · 9:00 AM</td><td>30</td><td>Lab 1</td></tr>
              <tr><td>BSIT 3-A</td><td>Database Systems</td><td>Mon / Wed · 1:00 PM</td><td>34</td><td>Room 204</td></tr>
              <tr><td>BSIT 3-B</td><td>Database Systems</td><td>Tue / Thu · 2:30 PM</td><td>30</td><td>Room 204</td></tr>
            </tbody></table></div>
          </section>
        )}
        {feature === 'users' && (
          <section className="portal-info-panel" aria-labelledby="admin-users-heading">
            <div className="portal-panel-heading"><div><h2 id="admin-users-heading">Accounts</h2><p>Sample access directory · User management service not connected</p></div></div>
            <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>
              <tr><td>Juan Dela Cruz</td><td>juan.delacruz@example.edu</td><td>Student</td><td>Active</td></tr>
              <tr><td>Maria Santos</td><td>maria.santos@example.edu</td><td>Faculty</td><td>Active</td></tr>
              <tr><td>Paolo Reyes</td><td>paolo.reyes@example.edu</td><td>Faculty</td><td>Active</td></tr>
              <tr><td>Registrar Admin</td><td>registrar@example.edu</td><td>Administrator</td><td>Active</td></tr>
            </tbody></table></div>
          </section>
        )}
        {feature === 'reports' && (
          <section className="portal-info-panel" aria-labelledby="faculty-report-heading">
            <div className="portal-panel-heading"><div><h2 id="faculty-report-heading">Teaching summary</h2><p>Faculty activity · First Semester · AY 2026–2027</p></div><button className="portal-primary-button" type="button" onClick={exportReport}>Download CSV</button></div>
            <div className="portal-report-grid">{[['Assigned classes', '4'], ['Students across classes', '126'], ['Grades awaiting entry', '12'], ['Attendance records this week', '18']].map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div>
            <div className="portal-report-note">This summary uses sample figures. Export downloads the displayed preview data.</div>
          </section>
        )}
      </div>
    </SisLayout>
  )
}
