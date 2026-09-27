import { useMemo, useRef, useState, type FormEvent } from 'react'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './StudentDirectory.css'

type SchoolLevel = 'Senior High School' | 'Tertiary'
type StudentStatus = 'Enrolled' | 'For Enrollment' | 'On Leave'
const statusFilters = [
  'All',
  'Enrolled',
  'For Enrollment',
  'On Leave',
] as const
type StatusFilter = (typeof statusFilters)[number]

type Student = {
  studentNumber: string
  name: string
  schoolLevel: SchoolLevel
  program: string
  yearLevel: string
  status: StudentStatus
}

type LevelFilter = 'All' | SchoolLevel

const students: Student[] = [
  {
    studentNumber: '2026-00124',
    name: 'Althea Marie Dela Cruz',
    schoolLevel: 'Senior High School',
    program: 'STEM',
    yearLevel: 'Grade 11',
    status: 'Enrolled',
  },
  {
    studentNumber: '2026-00125',
    name: 'Gabriel Santos',
    schoolLevel: 'Senior High School',
    program: 'ABM',
    yearLevel: 'Grade 12',
    status: 'Enrolled',
  },
  {
    studentNumber: '2026-00126',
    name: 'Kyla Mae Villanueva',
    schoolLevel: 'Senior High School',
    program: 'HUMSS',
    yearLevel: 'Grade 11',
    status: 'For Enrollment',
  },
  {
    studentNumber: '2026-00127',
    name: 'Nathaniel Flores',
    schoolLevel: 'Senior High School',
    program: 'TVL - ICT',
    yearLevel: 'Grade 12',
    status: 'Enrolled',
  },
  {
    studentNumber: '2026-00128',
    name: 'Sofia Anne Mendoza',
    schoolLevel: 'Senior High School',
    program: 'STEM',
    yearLevel: 'Grade 12',
    status: 'On Leave',
  },
  {
    studentNumber: '2024-00082',
    name: 'Miguel Andres Reyes',
    schoolLevel: 'Tertiary',
    program: 'BS Information Technology',
    yearLevel: 'Year 2',
    status: 'Enrolled',
  },
  {
    studentNumber: '2023-00041',
    name: 'Isabella Cruz',
    schoolLevel: 'Tertiary',
    program: 'Bachelor of Elementary Education',
    yearLevel: 'Year 3',
    status: 'Enrolled',
  },
  {
    studentNumber: '2025-00106',
    name: 'Joshua Ramirez',
    schoolLevel: 'Tertiary',
    program: 'BS Business Administration',
    yearLevel: 'Year 1',
    status: 'For Enrollment',
  },
  {
    studentNumber: '2022-00019',
    name: 'Camille Joy Garcia',
    schoolLevel: 'Tertiary',
    program: 'BS Information Technology',
    yearLevel: 'Year 4',
    status: 'On Leave',
  },
]

const levelFilters: LevelFilter[] = [
  'All',
  'Senior High School',
  'Tertiary',
]

function StudentDirectory() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [search, setSearch] = useState('')
  const [studentRecords, setStudentRecords] = useState(students)
  const [registrationMode, setRegistrationMode] = useState<'single' | 'multiple' | null>(null)
  const [registrationError, setRegistrationError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadNotice, setUploadNotice] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSingleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const studentNumber = String(formData.get('studentNumber')).trim()

    if (
      studentRecords.some(
        (student) => student.studentNumber.toLowerCase() === studentNumber.toLowerCase(),
      )
    ) {
      setRegistrationError('That student number is already listed.')
      return
    }

    const firstName = String(formData.get('firstName')).trim()
    const middleName = String(formData.get('middleName')).trim()
    const lastName = String(formData.get('lastName')).trim()
    const schoolLevel = String(formData.get('schoolLevel')) as SchoolLevel
    const student: Student = {
      studentNumber,
      name: [firstName, middleName, lastName].filter(Boolean).join(' '),
      schoolLevel,
      program: String(formData.get('program')).trim(),
      yearLevel: String(formData.get('yearLevel')).trim(),
      status: 'For Enrollment',
    }

    setStudentRecords((current) => [student, ...current])
    setSearch('')
    setLevelFilter('All')
    setStatusFilter('All')
    setRegistrationMode(null)
    setRegistrationError('')
  }

  function handleFileChange(file: File | undefined) {
    setUploadNotice('')
    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setSelectedFile(null)
      setUploadNotice('Please choose an Excel workbook with the .xlsx file extension.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
  }

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return studentRecords.filter((student) => {
      const matchesLevel =
        levelFilter === 'All' || student.schoolLevel === levelFilter
      const matchesStatus =
        statusFilter === 'All' || student.status === statusFilter
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          student.studentNumber,
          student.name,
          student.program,
          student.yearLevel,
          student.schoolLevel,
        ].some((value) => value.toLowerCase().includes(normalizedSearch))

      return matchesLevel && matchesStatus && matchesSearch
    })
  }, [levelFilter, search, statusFilter, studentRecords])

  const seniorHighCount = studentRecords.filter(
    (student) => student.schoolLevel === 'Senior High School',
  ).length
  const tertiaryCount = studentRecords.filter(
    (student) => student.schoolLevel === 'Tertiary',
  ).length

  return (
    <SisLayout
      active="Students"
      breadcrumb="Student Directory"
      breadcrumbRoot="Students"
      breadcrumbHref="#students"
      title="Students"
      subtitle="Browse students from Senior High School through Tertiary."
      icon="students"
    >
      <div className="student-directory">
        <div className="student-directory-notice">
          <strong>Sample data:</strong> this directory is a UI preview and is not
          connected to student records yet.
        </div>

        <section className="student-summary-grid" aria-label="Student totals">
          <article className="student-summary-card">
            <span className="student-summary-icon is-blue"><SisIcon name="students" /></span>
            <span className="student-summary-copy">
              <span>Total students</span>
              <strong>{studentRecords.length}</strong>
            </span>
          </article>
          <article className="student-summary-card">
            <span className="student-summary-icon is-violet"><SisIcon name="courses" /></span>
            <span className="student-summary-copy">
              <span>Senior High School</span>
              <strong>{seniorHighCount}</strong>
            </span>
          </article>
          <article className="student-summary-card">
            <span className="student-summary-icon is-green"><SisIcon name="cap" /></span>
            <span className="student-summary-copy">
              <span>Tertiary</span>
              <strong>{tertiaryCount}</strong>
            </span>
          </article>
        </section>

        <section className="student-directory-panel" aria-labelledby="student-list-title">
          <div className="student-directory-heading">
            <div>
              <h2 id="student-list-title">Student list</h2>
              <p>Search by student number, name, program, or year level.</p>
            </div>
            <div className="student-registration-actions">
              <button
                className="student-register-button"
                type="button"
                onClick={() => {
                  setRegistrationMode('single')
                  setRegistrationError('')
                }}
              >
                Register single student
              </button>
              <button
                className="student-register-button is-secondary"
                type="button"
                onClick={() => {
                  setRegistrationMode('multiple')
                  setSelectedFile(null)
                  setUploadNotice('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                Register multiple students
              </button>
            </div>
          </div>

          <div className="student-directory-controls">
            <div className="student-level-filters" aria-label="Filter by school level">
              {levelFilters.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`student-filter-button${levelFilter === level ? ' is-active' : ''}`}
                  aria-pressed={levelFilter === level}
                  onClick={() => setLevelFilter(level)}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="student-search-controls">
              <label className="student-search" htmlFor="student-search">
                <SisIcon name="students" />
                <input
                  id="student-search"
                  type="search"
                  placeholder="Search students..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="student-status-filter">
                <span className="visually-hidden">Filter by enrollment status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    const selectedStatus = statusFilters.find(
                      (status) => status === event.currentTarget.value,
                    )
                    if (selectedStatus) setStatusFilter(selectedStatus)
                  }}
                >
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <p className="student-results-count" aria-live="polite">
            Showing {filteredStudents.length} of {studentRecords.length} students
          </p>

          <div className="student-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">School level</th>
                  <th scope="col">Program / Strand</th>
                  <th scope="col">Year level</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.studentNumber}>
                    <td>
                      <span className="student-name-cell">
                        <span className="student-list-avatar" aria-hidden="true">
                          {student.name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')}
                        </span>
                        <span>
                          <strong>{student.name}</strong>
                          <small>{student.studentNumber}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={`school-level-label${student.schoolLevel === 'Senior High School' ? ' is-shs' : ' is-tertiary'}`}>
                        {student.schoolLevel}
                      </span>
                    </td>
                    <td>{student.program}</td>
                    <td>{student.yearLevel}</td>
                    <td>
                      <span className={`student-status is-${student.status.toLowerCase().replaceAll(' ', '-')}`}>
                        <span />
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td className="student-empty-cell" colSpan={5}>
                      <strong>No students found</strong>
                      <span>Try another name, student number, or filter.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {registrationMode && (
        <div
          className="student-registration-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRegistrationMode(null)
          }}
        >
          <section
            className="student-registration-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-registration-title"
          >
            <div className="student-registration-dialog-heading">
              <div>
                <h2 id="student-registration-title">
                  {registrationMode === 'single'
                    ? 'Register a student'
                    : 'Register multiple students'}
                </h2>
                <p>
                  {registrationMode === 'single'
                    ? 'Enter the school record details for one student.'
                    : 'Select an Excel workbook containing student records.'}
                </p>
              </div>
              <button
                className="student-dialog-close"
                type="button"
                aria-label="Close registration dialog"
                onClick={() => setRegistrationMode(null)}
              >
                ×
              </button>
            </div>

            {registrationMode === 'single' ? (
              <form className="student-registration-form" onSubmit={handleSingleRegistration}>
                <div className="student-registration-form-grid">
                  <label>
                    Student number <span>*</span>
                    <input name="studentNumber" required placeholder="e.g. 2026-00129" />
                  </label>
                  <label>
                    First name <span>*</span>
                    <input name="firstName" required autoComplete="given-name" />
                  </label>
                  <label>
                    Middle name
                    <input name="middleName" autoComplete="additional-name" />
                  </label>
                  <label>
                    Last name <span>*</span>
                    <input name="lastName" required autoComplete="family-name" />
                  </label>
                  <label>
                    School level <span>*</span>
                    <select name="schoolLevel" defaultValue="" required>
                      <option value="" disabled>Select school level</option>
                      <option value="Senior High School">Senior High School</option>
                      <option value="Tertiary">Tertiary</option>
                    </select>
                  </label>
                  <label>
                    Program / Strand <span>*</span>
                    <input name="program" required placeholder="e.g. STEM or BS Information Technology" />
                  </label>
                  <label>
                    Year level <span>*</span>
                    <input name="yearLevel" required placeholder="e.g. Grade 11 or Year 1" />
                  </label>
                </div>
                {registrationError && (
                  <p className="student-registration-error" role="alert">{registrationError}</p>
                )}
                <p className="student-dialog-preview-note">
                  UI preview only: this record will appear in the current session and is not saved to a database.
                </p>
                <div className="student-registration-dialog-actions">
                  <button type="button" className="student-dialog-cancel" onClick={() => setRegistrationMode(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="student-dialog-submit">
                    Add student
                  </button>
                </div>
              </form>
            ) : (
              <div className="student-multiple-upload">
                <div className="student-upload-dropzone">
                  <span className="student-upload-file-icon" aria-hidden="true">XLSX</span>
                  <strong>Choose an Excel workbook</strong>
                  <span>Accepted file type: .xlsx</span>
                  <input
                    ref={fileInputRef}
                    className="student-upload-input"
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    aria-label="Choose an .xlsx student file"
                    onChange={(event) => handleFileChange(event.currentTarget.files?.[0])}
                  />
                  <button
                    type="button"
                    className="student-dialog-submit"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose .xlsx file
                  </button>
                </div>
                {selectedFile && (
                  <p className="student-selected-file" aria-live="polite">
                    Selected file: <strong>{selectedFile.name}</strong>
                  </p>
                )}
                {uploadNotice && <p className="student-registration-error" role="alert">{uploadNotice}</p>}
                <p className="student-dialog-preview-note">
                  Spreadsheet importing is not connected yet. Selecting a file will not create or save student records.
                </p>
                <div className="student-registration-dialog-actions">
                  <button type="button" className="student-dialog-cancel" onClick={() => setRegistrationMode(null)}>
                    Close
                  </button>
                  <button
                    type="button"
                    className="student-dialog-submit"
                    disabled={!selectedFile}
                    onClick={() => setUploadNotice('File selected successfully. Student spreadsheet import is not connected yet.')}
                  >
                    Upload file
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </SisLayout>
  )
}

export default StudentDirectory
