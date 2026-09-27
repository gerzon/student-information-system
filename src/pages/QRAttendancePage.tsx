import { useState, type ReactNode } from 'react'
import { initialAcademicLevels } from './AcademicData'
import './AcademicHierarchyPage.css'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './QRAttendancePage.css'

function QRAttendancePage() {
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedSectionName, setSelectedSectionName] = useState('')

  const selectedLevel = initialAcademicLevels.find(
    (level) => level.id === selectedLevelId,
  )
  const selectedDepartment = selectedLevel?.departments.find(
    (department) => department.id === selectedDepartmentId,
  )
  const selectedCourse = selectedDepartment?.courses.find(
    (course) => course.id === selectedCourseId,
  )
  const selectedYearGroup = selectedCourse?.yearGroups.find(
    (yearGroup) => yearGroup.name === selectedYear,
  )
  const selectedSection = selectedYearGroup?.sections.find(
    (section) => section.name === selectedSectionName,
  )

  function selectLevel(levelId: string) {
    setSelectedLevelId(levelId)
    setSelectedDepartmentId('')
    setSelectedCourseId('')
    setSelectedYear('')
    setSelectedSectionName('')
  }

  function selectDepartment(departmentId: string) {
    setSelectedDepartmentId(departmentId)
    setSelectedCourseId('')
    setSelectedYear('')
    setSelectedSectionName('')
  }

  function selectCourse(courseId: string) {
    setSelectedCourseId(courseId)
    setSelectedYear('')
    setSelectedSectionName('')
  }

  function selectYear(year: string) {
    setSelectedYear(year)
    setSelectedSectionName('')
  }

  return (
    <SisLayout
      active="QR Attendance"
      breadcrumb="QR Attendance"
      breadcrumbRoot="QR Attendance"
      breadcrumbHref="#qr%20attendance"
      title="QR Attendance"
      subtitle="Choose a class through the education hierarchy to view its attendance details."
      icon="qrcodeattendance"
    >
      <div className="academic-hierarchy qr-attendance-page">
        <div className="academic-hierarchy-notice">
          <strong>Sample data:</strong> academic records are a UI preview and
          are not connected to a database.
        </div>

        <section className="academic-hierarchy-panel" aria-labelledby="qr-hierarchy-title">
          <div className="academic-hierarchy-heading">
            <div>
              <h2 id="qr-hierarchy-title">Choose a class</h2>
              <p>
                Education level <span>›</span> Department <span>›</span> Course
                <span> › </span> Year level <span>›</span> Section
              </p>
            </div>
          </div>

          <nav className="academic-breadcrumb" aria-label="Selected hierarchy">
            <button
              type="button"
              className={!selectedLevel ? 'is-current' : ''}
              onClick={() => selectLevel('')}
            >
              Education level
            </button>
            {selectedLevel && (
              <>
                <span aria-hidden="true">›</span>
                <button
                  type="button"
                  className={!selectedDepartment ? 'is-current' : ''}
                  onClick={() => selectDepartment('')}
                >
                  {selectedLevel.name}
                </button>
              </>
            )}
            {selectedDepartment && (
              <>
                <span aria-hidden="true">›</span>
                <button
                  type="button"
                  className={!selectedCourse ? 'is-current' : ''}
                  onClick={() => selectCourse('')}
                >
                  {selectedDepartment.name}
                </button>
              </>
            )}
            {selectedCourse && (
              <>
                <span aria-hidden="true">›</span>
                <button
                  type="button"
                  className={!selectedYear ? 'is-current' : ''}
                  onClick={() => selectYear('')}
                >
                  {selectedCourse.code}
                </button>
              </>
            )}
            {selectedYearGroup && (
              <>
                <span aria-hidden="true">›</span>
                <button
                  type="button"
                  className={!selectedSection ? 'is-current' : ''}
                  onClick={() => setSelectedSectionName('')}
                >
                  {selectedYearGroup.name}
                </button>
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
            <HierarchyStep
              title="1. Choose an education level"
              description="Start with tertiary or secondary education."
            >
              <div className="hierarchy-choice-grid">
                {initialAcademicLevels.map((level) => (
                  <button
                    className="hierarchy-choice-card"
                    type="button"
                    key={level.id}
                    onClick={() => selectLevel(level.id)}
                  >
                    <span className="hierarchy-choice-icon">
                      <SisIcon name={level.id === 'tertiary' ? 'cap' : 'students'} />
                    </span>
                    <span>
                      <strong>{level.name}</strong>
                      <small>{level.description}</small>
                    </span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyStep>
          )}

          {selectedLevel && !selectedDepartment && (
            <HierarchyStep
              title="2. Choose a department"
              description={`Departments under ${selectedLevel.name}.`}
            >
              <div className="hierarchy-choice-grid">
                {selectedLevel.departments.map((department) => (
                  <button
                    className="hierarchy-choice-card"
                    type="button"
                    key={department.id}
                    onClick={() => selectDepartment(department.id)}
                  >
                    <span className="hierarchy-choice-icon is-department">
                      <SisIcon name="courses" />
                    </span>
                    <span>
                      <strong>{department.name}</strong>
                      <small>{department.courses.length} {department.courses.length === 1 ? 'course' : 'courses'}</small>
                    </span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyStep>
          )}

          {selectedDepartment && !selectedCourse && (
            <HierarchyStep
              title="3. Choose a course or strand"
              description={`Programs offered by ${selectedDepartment.name}.`}
            >
              <div className="hierarchy-course-grid">
                {selectedDepartment.courses.map((course) => (
                  <button
                    className="hierarchy-course-card"
                    type="button"
                    key={course.id}
                    onClick={() => selectCourse(course.id)}
                  >
                    <span className="hierarchy-course-code">{course.code}</span>
                    <span className="hierarchy-course-copy">
                      <strong>{course.name}</strong>
                      <small>{course.duration} · {course.yearGroups.length} year levels</small>
                    </span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyStep>
          )}

          {selectedCourse && !selectedYearGroup && (
            <HierarchyStep
              title="4. Choose a year level"
              description={`Year levels under ${selectedCourse.code} — ${selectedCourse.name}.`}
            >
              <div className="hierarchy-year-grid">
                {selectedCourse.yearGroups.map((yearGroup) => (
                  <button
                    className="hierarchy-year-card"
                    type="button"
                    key={yearGroup.name}
                    onClick={() => selectYear(yearGroup.name)}
                  >
                    <span className="hierarchy-year-icon">
                      <SisIcon name="calendar" />
                    </span>
                    <span>
                      <strong>{yearGroup.name}</strong>
                      <small>{yearGroup.sections.length} {yearGroup.sections.length === 1 ? 'section' : 'sections'}</small>
                    </span>
                    <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </HierarchyStep>
          )}

          {selectedYearGroup && !selectedSection && (
            <HierarchyStep
              title="5. Choose a section"
              description={`Sections in ${selectedCourse?.code} · ${selectedYearGroup.name}.`}
            >
              {selectedYearGroup.sections.length ? (
                <div className="hierarchy-section-list">
                  {selectedYearGroup.sections.map((section) => (
                    <button
                      className="hierarchy-section-card qr-attendance-section"
                      type="button"
                      key={section.name}
                      onClick={() => setSelectedSectionName(section.name)}
                    >
                      <span className="hierarchy-section-icon">
                        <SisIcon name="sections" />
                      </span>
                      <span className="hierarchy-section-main">
                        <strong>{section.name}</strong>
                        <span>{section.adviser}</span>
                      </span>
                      <span className="hierarchy-section-detail">
                        <small>Room</small><span>{section.room}</span>
                      </span>
                      <span className="hierarchy-section-detail">
                        <small>Schedule</small><span>{section.schedule}</span>
                      </span>
                      <span className="hierarchy-section-detail">
                        <small>Capacity</small><span>{section.capacity} students</span>
                      </span>
                      <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="hierarchy-empty">No sections have been assigned to this year level yet.</p>
              )}
            </HierarchyStep>
          )}

          {selectedSection && (
            <HierarchyStep
              title="QR attendance class"
              description="This is the selected class for QR attendance."
            >
              <article className="qr-attendance-selected">
                <span className="qr-attendance-selected-icon">
                  <SisIcon name="qrcodeattendance" />
                </span>
                <div>
                  <strong>{selectedSection.name}</strong>
                  <span>{selectedCourse?.code} · {selectedYearGroup?.name} · {selectedDepartment?.name}</span>
                  <small>
                    {selectedSection.schedule} · {selectedSection.room} · Adviser: {selectedSection.adviser}
                  </small>
                </div>
                <button
                  className="academic-mini-button"
                  type="button"
                  onClick={() => setSelectedSectionName('')}
                >
                  Change section
                </button>
              </article>
            </HierarchyStep>
          )}
        </section>
      </div>
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

export default QRAttendancePage
