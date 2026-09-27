import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  initialAcademicLevels,
  type Course,
} from './AcademicData'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './AcademicHierarchyPage.css'

type DirectoryMode = 'courses' | 'sections'

function AcademicHierarchyPage({ mode }: { mode: DirectoryMode }) {
  const [levels, setLevels] = useState(initialAcademicLevels)
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [registrationLevelId, setRegistrationLevelId] = useState('')
  const [registrationDepartmentId, setRegistrationDepartmentId] = useState('')

  const selectedLevel = levels.find((level) => level.id === selectedLevelId)
  const selectedDepartment = selectedLevel?.departments.find(
    (department) => department.id === selectedDepartmentId,
  )
  const selectedCourse = selectedDepartment?.courses.find(
    (course) => course.id === selectedCourseId,
  )
  const selectedYearGroup = selectedCourse?.yearGroups.find(
    (yearGroup) => yearGroup.name === selectedYear,
  )
  const totalCourses = useMemo(
    () => levels.reduce((total, level) => total + level.departments.reduce(
      (departmentTotal, department) => departmentTotal + department.courses.length,
      0,
    ), 0),
    [levels],
  )
  const totalSections = useMemo(
    () => levels.reduce((total, level) => total + level.departments.reduce(
      (departmentTotal, department) => departmentTotal + department.courses.reduce(
        (courseTotal, course) => courseTotal + course.yearGroups.reduce(
          (yearTotal, yearGroup) => yearTotal + yearGroup.sections.length,
          0,
        ),
        0,
      ),
      0,
    ), 0),
    [levels],
  )

  function selectLevel(levelId: string) {
    setSelectedLevelId(levelId)
    setSelectedDepartmentId('')
    setSelectedCourseId('')
    setSelectedYear('')
  }

  function selectDepartment(departmentId: string) {
    setSelectedDepartmentId(departmentId)
    setSelectedCourseId('')
    setSelectedYear('')
  }

  function selectCourse(courseId: string) {
    setSelectedCourseId(courseId)
    setSelectedYear('')
  }

  function handleRegisterCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const levelId = String(formData.get('levelId'))
    const departmentId = String(formData.get('departmentId'))
    const code = String(formData.get('code')).trim().toUpperCase()
    const name = String(formData.get('name')).trim()
    const duration = String(formData.get('duration')).trim()
    const level = levels.find((item) => item.id === levelId)
    const department = level?.departments.find((item) => item.id === departmentId)

    if (!level || !department) {
      setRegistrationError('Choose an education level and department.')
      return
    }
    if (
      levels.some((item) =>
        item.departments.some((entry) =>
          entry.courses.some((course) => course.code.toLowerCase() === code.toLowerCase()),
        ),
      )
    ) {
      setRegistrationError('A course with this code already exists.')
      return
    }

    const yearNames = level.id === 'tertiary'
      ? ['Year 1', 'Year 2', 'Year 3', 'Year 4']
      : ['Grade 11', 'Grade 12']
    const newCourse: Course = {
      id: `course-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      code,
      name,
      duration,
      yearGroups: yearNames.map((yearName) => ({ name: yearName, sections: [] })),
    }

    setLevels((current) => current.map((item) =>
      item.id !== levelId
        ? item
        : {
            ...item,
            departments: item.departments.map((entry) =>
              entry.id !== departmentId
                ? entry
                : { ...entry, courses: [...entry.courses, newCourse] },
            ),
          },
    ))
    setSelectedLevelId(levelId)
    setSelectedDepartmentId(departmentId)
    setSelectedCourseId(newCourse.id)
    setSelectedYear('')
    setRegistrationError('')
    setRegistrationOpen(false)
  }

  const title = mode === 'courses' ? 'Courses Offered' : 'Sections Directory'
  const pageSubtitle = mode === 'courses'
    ? 'Browse academic programs through the school hierarchy and register new courses.'
    : 'Browse sections by education level, department, course, and year level.'

  return (
    <SisLayout
      active={mode === 'courses' ? 'Courses' : 'Sections'}
      breadcrumb={mode === 'courses' ? 'Course Directory' : 'Sections Directory'}
      breadcrumbRoot={mode === 'courses' ? 'Courses' : 'Sections'}
      breadcrumbHref={mode === 'courses' ? '#courses' : '#sections'}
      title={title}
      subtitle={pageSubtitle}
      icon={mode === 'courses' ? 'courses' : 'sections'}
    >
      <div className="academic-hierarchy">
        <div className="academic-hierarchy-notice">
          <strong>Sample data:</strong> the hierarchy and records are a UI preview
          and are not connected to a database.
        </div>

        <section className="academic-overview" aria-label="Academic directory totals">
          <article className="academic-overview-card">
            <span className="academic-overview-icon is-blue"><SisIcon name="courses" /></span>
            <span><small>Courses and programs</small><strong>{totalCourses}</strong></span>
          </article>
          <article className="academic-overview-card">
            <span className="academic-overview-icon is-violet"><SisIcon name="sections" /></span>
            <span><small>Sections</small><strong>{totalSections}</strong></span>
          </article>
          <article className="academic-overview-card">
            <span className="academic-overview-icon is-green"><SisIcon name="cap" /></span>
            <span><small>Education levels</small><strong>{levels.length}</strong></span>
          </article>
        </section>

        <section className="academic-hierarchy-panel" aria-labelledby="hierarchy-title">
          <div className="academic-hierarchy-heading">
            <div>
              <h2 id="hierarchy-title">
                {mode === 'courses' ? 'Academic hierarchy' : 'Browse sections'}
              </h2>
              <p>
                Education level <span>›</span> Department <span>›</span> Course <span>›</span> Year level <span>›</span> Sections
              </p>
            </div>
            <div className="academic-inline-actions">
              <button className="academic-mini-button" type="button">
                {mode === 'courses' ? 'Add education level' : 'Add level'}
              </button>
              <button className="academic-mini-button" type="button">
                {mode === 'courses' ? 'Add department' : 'Add department'}
              </button>
              <button className="academic-mini-button" type="button">
                {mode === 'courses' ? 'Register course' : 'Add course'}
              </button>
              {mode === 'sections' && (
                <>
                  <button className="academic-mini-button" type="button">
                    Add year level
                  </button>
                  <button className="academic-mini-button" type="button">
                    Add section
                  </button>
                </>
              )}
              {mode === 'courses' && (
                <button
                  className="academic-add-button"
                  type="button"
                  onClick={() => {
                    setRegistrationError('')
                    setRegistrationLevelId(selectedLevelId)
                    setRegistrationDepartmentId(selectedDepartmentId)
                    setRegistrationOpen(true)
                  }}
                >
                  <span aria-hidden="true">+</span> Register course
                </button>
              )}
            </div>
          </div>

          <nav className="academic-breadcrumb" aria-label="Selected hierarchy">
            <button type="button" className={!selectedLevel ? 'is-current' : ''} onClick={() => selectLevel('')}>
              Education level
            </button>
            {selectedLevel && (
              <>
                <span aria-hidden="true">›</span>
                <button type="button" className={!selectedDepartment ? 'is-current' : ''} onClick={() => selectDepartment('')}>
                  {selectedLevel.name}
                </button>
              </>
            )}
            {selectedDepartment && (
              <>
                <span aria-hidden="true">›</span>
                <button type="button" className={!selectedCourse ? 'is-current' : ''} onClick={() => selectCourse('')}>
                  {selectedDepartment.name}
                </button>
              </>
            )}
            {selectedCourse && (
              <>
                <span aria-hidden="true">›</span>
                <button type="button" className={!selectedYear ? 'is-current' : ''} onClick={() => setSelectedYear('')}>
                  {selectedCourse.code}
                </button>
              </>
            )}
            {selectedYearGroup && (
              <>
                <span aria-hidden="true">›</span>
                <span className="is-current">{selectedYearGroup.name}</span>
              </>
            )}
          </nav>

          {!selectedLevel && (
            <HierarchyStep title="1. Choose an education level" description="Start with tertiary or secondary education.">
              <div className="hierarchy-choice-grid">
                {levels.map((level) => (
                  <button className="hierarchy-choice-card" type="button" key={level.id} onClick={() => selectLevel(level.id)}>
                    <span className="hierarchy-choice-icon"><SisIcon name={level.id === 'tertiary' ? 'cap' : 'students'} /></span>
                    <span><strong>{level.name}</strong><small>{level.description}</small></span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyStep>
          )}

          {selectedLevel && !selectedDepartment && (
            <HierarchyStep title="2. Choose a department" description={`Departments under ${selectedLevel.name}.`}>
              <div className="hierarchy-choice-grid">
                {selectedLevel.departments.map((department) => (
                  <button className="hierarchy-choice-card" type="button" key={department.id} onClick={() => selectDepartment(department.id)}>
                    <span className="hierarchy-choice-icon is-department"><SisIcon name="courses" /></span>
                    <span><strong>{department.name}</strong><small>{department.courses.length} {department.courses.length === 1 ? 'course' : 'courses'}</small></span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyStep>
          )}

          {selectedDepartment && !selectedCourse && (
            <HierarchyStep title="3. Choose a course or strand" description={`Programs offered by ${selectedDepartment.name}.`}>
              <div className="hierarchy-course-grid">
                {selectedDepartment.courses.map((course) => (
                  <button className="hierarchy-course-card" type="button" key={course.id} onClick={() => selectCourse(course.id)}>
                    <span className="hierarchy-course-code">{course.code}</span>
                    <span className="hierarchy-course-copy">
                      <strong>{course.name}</strong>
                      <small>{course.duration} <span aria-hidden="true">·</span> {course.yearGroups.length} year levels</small>
                    </span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
                {selectedDepartment.courses.length === 0 && (
                  <p className="hierarchy-empty">No courses are registered in this department yet.</p>
                )}
              </div>
            </HierarchyStep>
          )}

          {selectedCourse && !selectedYearGroup && (
            <HierarchyStep title="4. Choose a year level" description={`Year levels under ${selectedCourse.code} — ${selectedCourse.name}.`}>
              <div className="hierarchy-year-grid">
                {selectedCourse.yearGroups.map((yearGroup) => (
                  <button className="hierarchy-year-card" type="button" key={yearGroup.name} onClick={() => setSelectedYear(yearGroup.name)}>
                    <span className="hierarchy-year-icon"><SisIcon name="calendar" /></span>
                    <span><strong>{yearGroup.name}</strong><small>{yearGroup.sections.length} {yearGroup.sections.length === 1 ? 'section' : 'sections'}</small></span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyStep>
          )}

          {selectedYearGroup && (
            <HierarchyStep title="5. Sections" description={`${selectedCourse?.code} · ${selectedYearGroup.name}`}>
              {selectedYearGroup.sections.length ? (
                <div className="hierarchy-section-list">
                  {selectedYearGroup.sections.map((section) => (
                    <article className="hierarchy-section-card" key={section.name}>
                      <span className="hierarchy-section-icon"><SisIcon name="sections" /></span>
                      <div className="hierarchy-section-main">
                        <strong>{section.name}</strong>
                        <span>{section.adviser}</span>
                      </div>
                      <div className="hierarchy-section-detail"><small>Room</small><span>{section.room}</span></div>
                      <div className="hierarchy-section-detail"><small>Schedule</small><span>{section.schedule}</span></div>
                      <div className="hierarchy-section-detail"><small>Capacity</small><span>{section.capacity} students</span></div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="hierarchy-empty">No sections have been assigned to this year level yet.</p>
              )}
            </HierarchyStep>
          )}
        </section>
      </div>

      {registrationOpen && mode === 'courses' && (
        <div
          className="academic-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRegistrationOpen(false)
          }}
        >
          <section className="academic-modal" role="dialog" aria-modal="true" aria-labelledby="course-registration-title">
            <div className="academic-modal-heading">
              <div>
                <h2 id="course-registration-title">Register course</h2>
                <p>Add a new course under an education level and department.</p>
              </div>
              <button type="button" className="academic-modal-close" aria-label="Close dialog" onClick={() => setRegistrationOpen(false)}>×</button>
            </div>
            <form className="academic-registration-form" onSubmit={handleRegisterCourse}>
              <div className="academic-form-grid">
                <label>
                  Education level <span>*</span>
                  <select
                    name="levelId"
                    value={registrationLevelId}
                    onChange={(event) => {
                      setRegistrationLevelId(event.currentTarget.value)
                      setRegistrationDepartmentId('')
                    }}
                    required
                  >
                    <option value="" disabled>Select education level</option>
                    {levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                  </select>
                </label>
                <label>
                  Department <span>*</span>
                  <select
                    name="departmentId"
                    value={registrationDepartmentId}
                    onChange={(event) => setRegistrationDepartmentId(event.currentTarget.value)}
                    required
                    disabled={!registrationLevelId}
                  >
                    <option value="" disabled>Select department</option>
                    {levels
                      .find((level) => level.id === registrationLevelId)
                      ?.departments.map((department) => (
                        <option key={department.id} value={department.id}>{department.name}</option>
                      ))}
                  </select>
                </label>
                <label>
                  Course code <span>*</span>
                  <input name="code" required maxLength={20} placeholder="e.g. BSHM" />
                </label>
                <label>
                  Course duration <span>*</span>
                  <input name="duration" required placeholder="e.g. 4 years" />
                </label>
                <label className="academic-form-full">
                  Course / program name <span>*</span>
                  <input name="name" required placeholder="Enter the official course name" />
                </label>
              </div>
              {registrationError && <p className="academic-form-error" role="alert">{registrationError}</p>}
              <p className="academic-preview-note">UI preview only: new courses are kept on this page and are not saved to a database.</p>
              <div className="academic-modal-actions">
                <button type="button" className="academic-cancel-button" onClick={() => setRegistrationOpen(false)}>Cancel</button>
                <button type="submit" className="academic-submit-button">Add course</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </SisLayout>
  )
}

function HierarchyStep({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="hierarchy-step">
      <div className="hierarchy-step-heading">
        <div><h3>{title}</h3><p>{description}</p></div>
      </div>
      {children}
    </section>
  )
}

export function CourseHierarchyDirectory() {
  return <AcademicHierarchyPage mode="courses" />
}

export function SectionsHierarchyDirectory() {
  return <AcademicHierarchyPage mode="sections" />
}
