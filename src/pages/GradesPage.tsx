import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { readSheet } from 'read-excel-file/browser'
import {
  initialAcademicLevels,
  type Course,
  type Department,
  type EducationLevel,
  type Section,
  type YearGroup,
} from './AcademicData'
import { loadSubjectsForClass } from './AcademicSubjects'
import SisLayout from './SisLayout'
import type { SisPortalRole } from './SisLayout'
import { SisIcon } from './SisIcon'
import './GradesPage.css'

type GradeStudent = {
  studentNumber: string
  name: string
}

type GradeImportEntry = {
  studentNumber: string
  grade: string
}

type GradeImportPreview = {
  fileName: string
  entries: GradeImportEntry[]
  errors: string[]
}

const rosterNames = [
  'Althea Marie Dela Cruz',
  'Gabriel Santos',
  'Kyla Mae Villanueva',
  'Nathaniel Flores',
  'Sofia Anne Mendoza',
  'Miguel Andres Reyes',
]

const gradePeriods = ['First grading', 'Second grading', 'Third grading', 'Fourth grading']

function cellText(value: unknown): string {
  return value == null ? '' : String(value).trim()
}

async function previewGradeWorkbook(file: File, roster: GradeStudent[]): Promise<GradeImportPreview> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return { fileName: file.name, entries: [], errors: ['Choose an .xlsx workbook.'] }
  }

  const rows = await readSheet(file, { trim: true })
  if (rows.length < 2) {
    return {
      fileName: file.name,
      entries: [],
      errors: ['The first worksheet must contain a header row and at least one grade.'],
    }
  }

  const headers = rows[0].map((value) => cellText(value).toLowerCase())
  const studentNumberIndex = headers.indexOf('student number')
  const gradeIndex = headers.indexOf('grade')
  const missingColumns = [
    studentNumberIndex === -1 ? 'Student Number' : '',
    gradeIndex === -1 ? 'Grade' : '',
  ].filter(Boolean)
  if (missingColumns.length) {
    return {
      fileName: file.name,
      entries: [],
      errors: [`Missing required columns: ${missingColumns.join(', ')}.`],
    }
  }
  if (headers.filter((header) => header === 'student number').length > 1 ||
    headers.filter((header) => header === 'grade').length > 1) {
    return {
      fileName: file.name,
      entries: [],
      errors: ['The header row must contain only one Student Number column and one Grade column.'],
    }
  }

  const studentsByNumber = new Map(
    roster.map((student) => [student.studentNumber.trim().toLowerCase(), student]),
  )
  const seenStudentNumbers = new Set<string>()
  const entries: GradeImportEntry[] = []
  const errors: string[] = []

  rows.slice(1).forEach((row, index) => {
    if (row.every((value) => cellText(value) === '')) return

    const rowNumber = index + 2
    const studentNumber = cellText(row[studentNumberIndex])
    const gradeText = cellText(row[gradeIndex])
    const normalizedNumber = studentNumber.toLowerCase()

    if (!studentNumber) {
      errors.push(`Row ${rowNumber}: Student Number is required.`)
      return
    }
    if (seenStudentNumbers.has(normalizedNumber)) {
      errors.push(`Row ${rowNumber}: Student Number ${studentNumber} appears more than once.`)
      return
    }
    seenStudentNumbers.add(normalizedNumber)
    const student = studentsByNumber.get(normalizedNumber)
    if (!student) {
      errors.push(`Row ${rowNumber}: Student Number ${studentNumber} is not in this class roster.`)
      return
    }
    if (!gradeText) {
      errors.push(`Row ${rowNumber}: Grade is required.`)
      return
    }

    const grade = Number(gradeText)
    if (!Number.isFinite(grade) || grade < 0 || grade > 100) {
      errors.push(`Row ${rowNumber}: Grade must be a number from 0 to 100.`)
      return
    }

    entries.push({ studentNumber: student.studentNumber, grade: String(grade) })
  })

  if (!entries.length && errors.length === 0) errors.push('No grade rows were found in the first worksheet.')
  return { fileName: file.name, entries, errors }
}

function getRoster(section: Section, level: EducationLevel): GradeStudent[] {
  const prefix = level.id === 'tertiary' ? '2024' : '2026'
  const sectionCode = section.name.replace(/[^a-z0-9]/gi, '').slice(-2).toUpperCase()

  return rosterNames.map((name, index) => ({
    studentNumber: `${prefix}-${sectionCode}${String(index + 1).padStart(3, '0')}`,
    name,
  }))
}

function GradesPage({ role = 'admin' }: { role?: SisPortalRole }) {
  const [levels] = useState(initialAcademicLevels)
  const [levelId, setLevelId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [yearName, setYearName] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [yearSectionSearch, setYearSectionSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [period, setPeriod] = useState(gradePeriods[0])
  const [subject, setSubject] = useState('')
  const [gradeValues, setGradeValues] = useState<Record<string, string>>({})
  const [gradeError, setGradeError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [importPreview, setImportPreview] = useState<GradeImportPreview | null>(null)
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectStorageError, setSubjectStorageError] = useState('')
  const importFileRef = useRef<HTMLInputElement>(null)

  const selectedLevel = levels.find((level) => level.id === levelId)
  const selectedDepartment = selectedLevel?.departments.find(
    (department) => department.id === departmentId,
  )
  const selectedCourse = selectedDepartment?.courses.find(
    (course) => course.id === courseId,
  )
  const selectedYear = selectedCourse?.yearGroups.find(
    (yearGroup) => yearGroup.name === yearName,
  )
  const selectedSection = selectedYear?.sections.find(
    (section) => section.name === sectionName,
  )

  const filteredYearGroups = useMemo(() => {
    const query = yearSectionSearch.trim().toLowerCase()
    if (!selectedCourse) return []

    return selectedCourse.yearGroups
      .map((yearGroup) => ({
        ...yearGroup,
        sections: yearGroup.sections.filter((section) =>
          !query ||
          `${yearGroup.name} ${section.name} ${section.adviser} ${section.room}`
            .toLowerCase()
            .includes(query),
        ),
      }))
      .filter((yearGroup) => !query || yearGroup.name.toLowerCase().includes(query) || yearGroup.sections.length > 0)
  }, [selectedCourse, yearSectionSearch])

  const filteredRoster = useMemo(() => {
    if (!selectedSection || !selectedLevel) return []
    const query = studentSearch.trim().toLowerCase()
    return getRoster(selectedSection, selectedLevel).filter((student) =>
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.studentNumber.toLowerCase().includes(query),
    )
  }, [selectedLevel, selectedSection, studentSearch])

  function selectLevel(level: EducationLevel) {
    setLevelId(level.id)
    setDepartmentId('')
    setCourseId('')
    setYearName('')
    setSectionName('')
    setYearSectionSearch('')
    setSubjects([])
    setSubjectStorageError('')
    clearNotices()
  }

  function selectDepartment(department: Department) {
    setDepartmentId(department.id)
    setCourseId('')
    setYearName('')
    setSectionName('')
    setYearSectionSearch('')
    setSubjects([])
    setSubjectStorageError('')
    clearNotices()
  }

  function selectCourse(course: Course) {
    setCourseId(course.id)
    setYearName('')
    setSectionName('')
    setYearSectionSearch('')
    setSubject('')
    setSubjects([])
    setSubjectStorageError('')
    clearNotices()
  }

  function selectSection(yearGroup: YearGroup, section: Section) {
    setYearName(yearGroup.name)
    setSectionName(section.name)
    setStudentSearch('')
    setSubject('')
    if (selectedLevel && selectedCourse) {
      try {
        const result = loadSubjectsForClass({
          levelId: selectedLevel.id,
          courseId: selectedCourse.id,
          yearName: yearGroup.name,
          sectionName: section.name,
        })
        setSubjects(result.subjects.map((item) => item.name))
        setSubjectStorageError('')
      } catch (error: unknown) {
        setSubjects([])
        setSubjectStorageError(error instanceof Error ? error.message : 'Could not load this class’s subjects.')
      }
    }
    clearNotices()
  }

  function clearNotices() {
    setGradeError('')
    setSavedNotice('')
    setImportPreview(null)
    setImportError('')
  }

  function getGradeKey(studentNumber: string) {
    return `${sectionName}:${subject}:${period}:${studentNumber}`
  }

  function handleSaveGrades(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const enteredGrades = filteredRoster
      .map((student) => gradeValues[getGradeKey(student.studentNumber)] ?? '')
      .filter((value) => value !== '')
    const hasInvalidGrade = enteredGrades.some((value) => {
      const grade = Number(value)
      return !Number.isFinite(grade) || grade < 0 || grade > 100
    })

    if (!subject) {
      setGradeError('Select a subject before entering grades.')
      setSavedNotice('')
      return
    }
    if (hasInvalidGrade) {
      setGradeError('Grades must be numbers from 0 to 100.')
      setSavedNotice('')
      return
    }

    setGradeError('')
    setSavedNotice(
      `Grades for ${selectedCourse?.code} ${sectionName} · ${subject} · ${period} saved in this page session.`,
    )
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file || !selectedSection || !selectedLevel) return

    setImporting(true)
    clearNotices()
    try {
      setImportPreview(await previewGradeWorkbook(file, getRoster(selectedSection, selectedLevel)))
    } catch (error: unknown) {
      setImportError(error instanceof Error ? `Could not read this workbook: ${error.message}` : 'Could not read this workbook.')
    } finally {
      setImporting(false)
    }
  }

  function applyGradeImport() {
    if (!importPreview || importPreview.errors.length > 0 || !subject) return
    const importedValues = Object.fromEntries(
      importPreview.entries.map(({ studentNumber, grade }) => [getGradeKey(studentNumber), grade]),
    )
    setGradeValues((current) => ({ ...current, ...importedValues }))
    setSavedNotice(
      `Imported grades for ${importPreview.entries.length} students · ${subject} · ${period}.`,
    )
    setGradeError('')
    setImportPreview(null)
    setImportError('')
  }

  function gradeStatus(value: string) {
    if (!value) return 'Not entered'
    return Number(value) >= 75 ? 'Passed' : 'Needs improvement'
  }

  return (
    <SisLayout
      role={role}
      active="Grades"
      breadcrumb="Grade Entry"
      breadcrumbRoot="Grades"
      breadcrumbHref="#grades"
      title="Grade Entry"
      subtitle="Select a class through the academic hierarchy, then enter student grades."
      icon="grades"
    >
      <div className="grades-page">
        <div className="grades-preview-notice">
          <strong>Sample data:</strong> students and grades are a UI preview. Saving
          only keeps the entered values in this page session.
        </div>

        <section className="grades-hierarchy-panel" aria-labelledby="grades-hierarchy-title">
          <div className="grades-panel-heading">
            <div>
              <h2 id="grades-hierarchy-title">Select a class</h2>
              <p>Follow the school structure to locate a year level and section.</p>
            </div>
          </div>

          <nav className="grades-breadcrumb" aria-label="Selected class hierarchy">
            <button type="button" className={!selectedLevel ? 'is-current' : ''} onClick={() => {
              setLevelId('')
              setDepartmentId('')
              setCourseId('')
              setYearName('')
              setSectionName('')
              clearNotices()
            }}>
              Education level
            </button>
            {selectedLevel && (
              <>
                <span aria-hidden="true">›</span>
                <button type="button" className={!selectedDepartment ? 'is-current' : ''} onClick={() => {
                  setDepartmentId('')
                  setCourseId('')
                  setYearName('')
                  setSectionName('')
                  clearNotices()
                }}>{selectedLevel.name}</button>
              </>
            )}
            {selectedDepartment && (
              <>
                <span aria-hidden="true">›</span>
                <button type="button" className={!selectedCourse ? 'is-current' : ''} onClick={() => selectDepartment(selectedDepartment)}>{selectedDepartment.name}</button>
              </>
            )}
            {selectedCourse && (
              <>
                <span aria-hidden="true">›</span>
                <button type="button" className={!selectedYear ? 'is-current' : ''} onClick={() => selectCourse(selectedCourse)}>{selectedCourse.code}</button>
              </>
            )}
            {selectedYear && (
              <>
                <span aria-hidden="true">›</span>
                <button type="button" className={!selectedSection ? 'is-current' : ''} onClick={() => {
                  setSectionName('')
                  clearNotices()
                }}>{selectedYear.name}</button>
              </>
            )}
            {selectedSection && (
              <>
                <span aria-hidden="true">›</span>
                <span className="is-current">{selectedSection.name}</span>
              </>
            )}
          </nav>

          {!selectedLevel && (
            <HierarchyChooserStep title="1. Education level" description="Choose tertiary or secondary education.">
              <div className="grades-choice-grid">
                {levels.map((level) => (
                  <button className="grades-choice-card" key={level.id} type="button" onClick={() => selectLevel(level)}>
                    <span className="grades-choice-icon"><SisIcon name={level.id === 'tertiary' ? 'cap' : 'students'} /></span>
                    <span><strong>{level.name}</strong><small>{level.description}</small></span>
                    <span className="grades-chevron" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyChooserStep>
          )}

          {selectedLevel && !selectedDepartment && (
            <HierarchyChooserStep title="2. Department" description={`Departments under ${selectedLevel.name}.`}>
              <div className="grades-choice-grid">
                {selectedLevel.departments.map((department) => (
                  <button className="grades-choice-card" key={department.id} type="button" onClick={() => selectDepartment(department)}>
                    <span className="grades-choice-icon is-violet"><SisIcon name="courses" /></span>
                    <span><strong>{department.name}</strong><small>{department.courses.length} courses</small></span>
                    <span className="grades-chevron" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyChooserStep>
          )}

          {selectedDepartment && !selectedCourse && (
            <HierarchyChooserStep title="3. Course or strand" description={`Choose a program in ${selectedDepartment.name}.`}>
              <div className="grades-course-list">
                {selectedDepartment.courses.map((course) => (
                  <button className="grades-course-option" key={course.id} type="button" onClick={() => selectCourse(course)}>
                    <span className="grades-course-code">{course.code}</span>
                    <span><strong>{course.name}</strong><small>{course.duration}</small></span>
                    <span className="grades-chevron" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyChooserStep>
          )}

          {selectedCourse && !selectedSection && (
            <HierarchyChooserStep
              title="4. Year level and section"
              description={`Search or choose a class in ${selectedCourse.code}.`}
            >
              <label className="grades-search" htmlFor="year-section-search">
                <SisIcon name="students" />
                <input
                  id="year-section-search"
                  type="search"
                  placeholder="Search year level, section, adviser, or room..."
                  value={yearSectionSearch}
                  onChange={(event) => setYearSectionSearch(event.target.value)}
                />
              </label>
              <div className="grades-year-section-list">
                {filteredYearGroups.map((yearGroup) => (
                  <div className="grades-year-group" key={yearGroup.name}>
                    <h4>{yearGroup.name}</h4>
                    {yearGroup.sections.length ? (
                      <div className="grades-section-options">
                        {yearGroup.sections.map((section) => (
                          <button
                            className="grades-section-option"
                            key={section.name}
                            type="button"
                            onClick={() => selectSection(yearGroup, section)}
                          >
                            <span className="grades-choice-icon is-green"><SisIcon name="sections" /></span>
                            <span><strong>{section.name}</strong><small>{section.adviser} · {section.room}</small></span>
                            <span className="grades-chevron" aria-hidden="true">›</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="grades-no-section">No sections for this year level yet.</p>
                    )}
                  </div>
                ))}
                {filteredYearGroups.length === 0 && (
                  <p className="grades-no-section">No year levels or sections match that search.</p>
                )}
              </div>
            </HierarchyChooserStep>
          )}
        </section>

        {selectedSection && selectedYear && selectedCourse && selectedLevel && (
          <section className="gradebook-panel" aria-labelledby="gradebook-title">
            <div className="gradebook-heading">
              <div className="gradebook-title-group">
                <span className="gradebook-icon"><SisIcon name="grades" /></span>
                <div>
                  <h2 id="gradebook-title">{selectedSection.name}</h2>
                  <p>{selectedLevel.name} · {selectedDepartment?.name} · {selectedCourse.code} · {selectedYear.name}</p>
                </div>
              </div>
              <span className="gradebook-count">{getRoster(selectedSection, selectedLevel).length} students</span>
            </div>

            <form onSubmit={handleSaveGrades}>
              <div className="gradebook-controls">
                <label>
                  Subject
                  <select value={subject} onChange={(event) => {
                    setSubject(event.currentTarget.value)
                    clearNotices()
                  }} disabled={Boolean(subjectStorageError) || subjects.length === 0}>
                    <option value="">Select subject</option>
                    {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Grading period
                  <select value={period} onChange={(event) => {
                    setPeriod(event.currentTarget.value)
                    clearNotices()
                  }}>
                    {gradePeriods.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="gradebook-student-search">
                  Find student
                  <span className="gradebook-search-input">
                    <SisIcon name="students" />
                    <input
                      type="search"
                      placeholder="Name or student number"
                      value={studentSearch}
                      onChange={(event) => setStudentSearch(event.target.value)}
                    />
                  </span>
                </label>
              </div>
              <div className="gradebook-import">
                <div>
                  <strong>Import grades from Excel</strong>
                  <p>Upload an .xlsx file with <b>Student Number</b> and <b>Grade</b> columns. Student numbers must match this class roster.</p>
                </div>
                <button
                  className="gradebook-import-button"
                  type="button"
                  onClick={() => importFileRef.current?.click()}
                  disabled={!subject || importing}
                >
                  {importing ? 'Reading workbook…' : 'Choose .xlsx file'}
                </button>
                <input
                  ref={importFileRef}
                  className="gradebook-import-file"
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => void handleImportFile(event)}
                  aria-label="Choose an Excel grade workbook"
                />
              </div>
              {importError && <p className="gradebook-error" role="alert">{importError}</p>}
              {importPreview && (
                <div className="gradebook-import-preview" aria-live="polite">
                  <p>
                    <strong>{importPreview.fileName}</strong>
                    {importPreview.errors.length
                      ? ` · ${importPreview.entries.length} valid grade${importPreview.entries.length === 1 ? '' : 's'}, ${importPreview.errors.length} issue${importPreview.errors.length === 1 ? '' : 's'}`
                      : ` · ${importPreview.entries.length} grades ready to import`}
                  </p>
                  {importPreview.errors.length > 0 && (
                    <ul className="gradebook-import-errors" role="alert">
                      {importPreview.errors.slice(0, 5).map((error) => <li key={error}>{error}</li>)}
                      {importPreview.errors.length > 5 && (
                        <li>And {importPreview.errors.length - 5} more issue{importPreview.errors.length - 5 === 1 ? '' : 's'}.</li>
                      )}
                    </ul>
                  )}
                  <button
                    className="gradebook-import-apply"
                    type="button"
                    onClick={applyGradeImport}
                    disabled={importPreview.entries.length === 0 || importPreview.errors.length > 0}
                  >
                    Import grades
                  </button>
                </div>
              )}
              {subjectStorageError && <p className="gradebook-error" role="alert">{subjectStorageError}</p>}
              {!subjectStorageError && subjects.length === 0 && (
                <p className="gradebook-hint">
                  No subjects are configured for this class. <a href="#subjects">Manage class subjects</a>.
                </p>
              )}
              {!subject && <p className="gradebook-hint">Choose a subject to enable grade entry.</p>}
              {gradeError && <p className="gradebook-error" role="alert">{gradeError}</p>}
              {savedNotice && <p className="gradebook-success" role="status">{savedNotice}</p>}

              <div className="gradebook-table-wrap">
                <table className="gradebook-table">
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Grade (0–100)</th>
                      <th scope="col">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoster.map((student) => {
                      const key = getGradeKey(student.studentNumber)
                      const value = gradeValues[key] ?? ''
                      return (
                        <tr key={student.studentNumber}>
                          <td>
                            <span className="gradebook-student">
                              <span className="gradebook-avatar" aria-hidden="true">
                                {student.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}
                              </span>
                              <span><strong>{student.name}</strong><small>{student.studentNumber}</small></span>
                            </span>
                          </td>
                          <td>
                            <input
                              className="gradebook-grade-input"
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              inputMode="decimal"
                              aria-label={`Grade for ${student.name}`}
                              placeholder="—"
                              value={value}
                              disabled={!subject}
                              onChange={(event) => {
                                setGradeValues((current) => ({ ...current, [key]: event.currentTarget.value }))
                                setSavedNotice('')
                                setGradeError('')
                              }}
                            />
                          </td>
                          <td>
                            <span className={`gradebook-result${value ? Number(value) >= 75 ? ' is-passed' : ' is-failed' : ' is-empty'}`}>
                              {gradeStatus(value)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredRoster.length === 0 && (
                      <tr><td className="gradebook-empty" colSpan={3}>No students match that search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="gradebook-actions">
                <p>Passing grade: 75. Grades are not saved to the school database.</p>
                <button className="gradebook-save-button" type="submit" disabled={!subject}>
                  Save grades
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </SisLayout>
  )
}

function HierarchyChooserStep({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grades-hierarchy-step">
      <div className="grades-step-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {children}
    </section>
  )
}

export default GradesPage
