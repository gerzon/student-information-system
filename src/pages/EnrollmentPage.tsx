import { useMemo, useState } from 'react'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './EnrollmentPage.css'

type EnrollmentStatus = 'Pending' | 'Approved' | 'Declined'
type Enrollment = {
  id: string
  studentNumber: string
  name: string
  program: string
  yearLevel: string
  submitted: string
  status: EnrollmentStatus
}

const initialEnrollments: Enrollment[] = [
  { id: 'enr-001', studentNumber: '2026-00126', name: 'Kyla Mae Villanueva', program: 'HUMSS', yearLevel: 'Grade 11', submitted: 'Sep 24, 2026', status: 'Pending' },
  { id: 'enr-002', studentNumber: '2025-00106', name: 'Joshua Ramirez', program: 'BS Business Administration', yearLevel: 'Year 1', submitted: 'Sep 23, 2026', status: 'Pending' },
  { id: 'enr-003', studentNumber: '2026-00129', name: 'Bianca Torres', program: 'STEM', yearLevel: 'Grade 11', submitted: 'Sep 22, 2026', status: 'Approved' },
  { id: 'enr-004', studentNumber: '2024-00091', name: 'Rafael Lim', program: 'BS Information Technology', yearLevel: 'Year 3', submitted: 'Sep 20, 2026', status: 'Declined' },
]

const filters: Array<'All' | EnrollmentStatus> = ['All', 'Pending', 'Approved', 'Declined']

function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [filter, setFilter] = useState<'All' | EnrollmentStatus>('All')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const visibleEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase()
    return enrollments.filter((enrollment) => {
      const matchesFilter = filter === 'All' || enrollment.status === filter
      const matchesSearch =
        !query ||
        [enrollment.name, enrollment.studentNumber, enrollment.program, enrollment.yearLevel]
          .some((value) => value.toLowerCase().includes(query))
      return matchesFilter && matchesSearch
    })
  }, [enrollments, filter, search])

  function updateStatus(id: string, status: EnrollmentStatus) {
    setEnrollments((current) =>
      current.map((enrollment) => enrollment.id === id ? { ...enrollment, status } : enrollment),
    )
    setNotice(`Enrollment ${status.toLowerCase()} successfully.`)
  }

  return (
    <SisLayout
      active="Enrollment"
      breadcrumb="Enrollment Management"
      breadcrumbRoot="Students"
      breadcrumbHref="#students"
      title="Enrollments"
      subtitle="Review and manage student enrollment requests for the current academic year."
      icon="students"
    >
      <div className="enrollment-page">
        <div className="enrollment-notice">
          <strong>Sample data:</strong> enrollment requests are shown for preview purposes and are not connected to a registrar workflow yet.
        </div>

        <section className="enrollment-summary-grid" aria-label="Enrollment totals">
          {[
            ['Pending review', 'Pending', 'is-amber'],
            ['Approved', 'Approved', 'is-green'],
            ['Declined', 'Declined', 'is-red'],
            ['Total requests', 'All', 'is-blue'],
          ].map(([label, status, tone]) => (
            <button
              key={label}
              type="button"
              className="enrollment-summary-card"
              onClick={() => setFilter(status as 'All' | EnrollmentStatus)}
            >
              <span className={`enrollment-summary-icon ${tone}`}><SisIcon name="students" /></span>
              <span>
                <small>{label}</small>
                <strong>{status === 'All' ? enrollments.length : enrollments.filter((item) => item.status === status).length}</strong>
              </span>
            </button>
          ))}
        </section>

        <section className="enrollment-panel" aria-labelledby="enrollment-list-title">
          <div className="enrollment-heading">
            <div>
              <h2 id="enrollment-list-title">Enrollment requests</h2>
              <p>Review student details and update each request as it is processed.</p>
            </div>
            <span className="enrollment-period">Academic year 2026–2027</span>
          </div>

          <div className="enrollment-controls">
            <div className="enrollment-filters" aria-label="Filter enrollment requests">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`enrollment-filter${filter === item ? ' is-active' : ''}`}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="enrollment-search">
              <SisIcon name="students" />
              <span className="visually-hidden">Search enrollment requests</span>
              <input
                type="search"
                placeholder="Search requests..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {notice && <p className="enrollment-action-notice" role="status">{notice}</p>}
          <p className="enrollment-results-count" aria-live="polite">
            Showing {visibleEnrollments.length} of {enrollments.length} requests
          </p>

          <div className="enrollment-table-wrap">
            <table className="enrollment-table">
              <thead>
                <tr><th>Student</th><th>Program / Year</th><th>Submitted</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr>
              </thead>
              <tbody>
                {visibleEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td><span className="enrollment-student"><span className="enrollment-avatar">{enrollment.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span><span><strong>{enrollment.name}</strong><small>{enrollment.studentNumber}</small></span></span></td>
                    <td><strong>{enrollment.program}</strong><small>{enrollment.yearLevel}</small></td>
                    <td>{enrollment.submitted}</td>
                    <td><span className={`enrollment-status is-${enrollment.status.toLowerCase()}`}><span />{enrollment.status}</span></td>
                    <td><div className="enrollment-actions">
                      {enrollment.status === 'Pending' && <><button type="button" onClick={() => updateStatus(enrollment.id, 'Approved')}>Approve</button><button type="button" className="is-decline" onClick={() => updateStatus(enrollment.id, 'Declined')}>Decline</button></>}
                      {enrollment.status !== 'Pending' && <button type="button" className="is-secondary" onClick={() => updateStatus(enrollment.id, 'Pending')}>Reopen</button>}
                    </div></td>
                  </tr>
                ))}
                {visibleEnrollments.length === 0 && <tr><td className="enrollment-empty" colSpan={5}><strong>No enrollment requests found</strong><span>Try another search or status filter.</span></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SisLayout>
  )
}

export default EnrollmentPage
