import { useEffect, useMemo, useState } from 'react'
import { loadSubjectsForClass, type ManagedSubject } from './AcademicSubjects'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './MyGradesPage.css'

type GradeRecord = {
  prelim: number
  midterm: number
  final: number
}

type SelectedGrade = {
  subjectName: string
  subjectCode: string
  term: string
  grade: number
}

const gradeComponents = [
  { label: 'Quizzes', weight: 20 },
  { label: 'Performance Tasks', weight: 60 },
  { label: 'Term Exam', weight: 20 },
] as const

const studentClass = {
  levelId: 'tertiary',
  courseId: 'bsit',
  yearName: 'Year 2',
  sectionName: 'BSIT 2A',
}

const sampleGrades: GradeRecord[] = [
  { prelim: 88, midterm: 90, final: 92 },
  { prelim: 91, midterm: 89, final: 90 },
  { prelim: 86, midterm: 88, final: 91 },
  { prelim: 93, midterm: 94, final: 95 },
]

function getGrade(index: number): GradeRecord {
  return sampleGrades[index % sampleGrades.length]
}

function getFinalGrade(grades: GradeRecord) {
  return Math.round((grades.prelim + grades.midterm + grades.final) / 3)
}

function getGradeStatus(grade: number) {
  return grade >= 75 ? 'Passed' : 'Needs improvement'
}

function MyGradesPage() {
  const [selectedGrade, setSelectedGrade] = useState<SelectedGrade | null>(null)
  const subjectState = useMemo(() => {
    try {
      return { subjects: loadSubjectsForClass(studentClass).subjects, error: '' }
    } catch (error: unknown) {
      return {
        subjects: [] as ManagedSubject[],
        error: error instanceof Error ? error.message : 'Could not load your subject load.',
      }
    }
  }, [])

  const totalUnits = subjectState.subjects.reduce((total, subject) => total + subject.units, 0)
  const finalGrades = subjectState.subjects.map((_, index) =>
    getFinalGrade(getGrade(index)),
  )
  const average = finalGrades.length
    ? Math.round(finalGrades.reduce((total, grade) => total + grade, 0) / finalGrades.length)
    : 0

  useEffect(() => {
    if (!selectedGrade) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedGrade(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGrade])

  return (
    <SisLayout
      role="student"
      active="My Grades"
      breadcrumb="My Grades"
      breadcrumbRoot="My Grades"
      breadcrumbHref="#my%20grades"
      title="My Grades"
      subtitle="View your grades for the subjects included in your current load."
      icon="grades"
    >
      <div className="my-grades-page">
        <section className="my-grades-student-card" aria-label="Student and class information">
          <div className="my-grades-avatar" aria-hidden="true">JD</div>
          <div>
            <strong>Juan Dela Cruz</strong>
            <span>2024-2A001 · Bachelor of Science in Information Technology</span>
          </div>
          <span className="my-grades-term">Academic Year 2025–2026 · First Semester</span>
        </section>

        <section className="my-grades-summary" aria-label="Grades summary">
          <div className="my-grades-summary-item">
            <span className="my-grades-summary-icon"><SisIcon name="courses" /></span>
            <span><strong>{subjectState.subjects.length}</strong><small>Subjects loaded</small></span>
          </div>
          <div className="my-grades-summary-item">
            <span className="my-grades-summary-icon is-violet"><SisIcon name="cap" /></span>
            <span><strong>{totalUnits}</strong><small>Total units</small></span>
          </div>
          <div className="my-grades-summary-item">
            <span className="my-grades-summary-icon is-green"><SisIcon name="grades" /></span>
            <span><strong>{average || '—'}</strong><small>Current average</small></span>
          </div>
        </section>

        <section className="my-grades-panel" aria-labelledby="my-grades-table-title">
          <div className="my-grades-panel-heading">
            <div>
              <h2 id="my-grades-table-title">First semester grades</h2>
              <p>{studentClass.sectionName} · Grades are based on your enrolled subject load.</p>
            </div>
            <span className="my-grades-status"><span aria-hidden="true">●</span> Current term</span>
          </div>

          {subjectState.error && <p className="my-grades-error" role="alert">{subjectState.error}</p>}
          {!subjectState.error && subjectState.subjects.length === 0 && (
            <p className="my-grades-empty">No subjects are currently included in your load.</p>
          )}
          {!subjectState.error && subjectState.subjects.length > 0 && (
            <div className="my-grades-table-wrap">
              <table className="my-grades-table">
                <thead>
                  <tr>
                    <th scope="col">Subject</th>
                    <th scope="col">Units</th>
                    <th scope="col">Prelim</th>
                    <th scope="col">Midterm</th>
                    <th scope="col">Final</th>
                    <th scope="col">Final grade</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectState.subjects.map((subject, index) => {
                    const grades = getGrade(index)
                    const finalGrade = getFinalGrade(grades)
                    return (
                      <tr key={subject.id}>
                        <td><strong>{subject.name}</strong><span>{subject.code}</span></td>
                        <td>{subject.units}</td>
                        <td>
                          <button
                            type="button"
                            className="my-grades-score-button"
                            aria-label={`View ${subject.name} prelim grade details`}
                            onClick={() => setSelectedGrade({
                              subjectName: subject.name,
                              subjectCode: subject.code,
                              term: 'Prelim',
                              grade: grades.prelim,
                            })}
                          >
                            {grades.prelim}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="my-grades-score-button"
                            aria-label={`View ${subject.name} midterm grade details`}
                            onClick={() => setSelectedGrade({
                              subjectName: subject.name,
                              subjectCode: subject.code,
                              term: 'Midterm',
                              grade: grades.midterm,
                            })}
                          >
                            {grades.midterm}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="my-grades-score-button"
                            aria-label={`View ${subject.name} final term grade details`}
                            onClick={() => setSelectedGrade({
                              subjectName: subject.name,
                              subjectCode: subject.code,
                              term: 'Final',
                              grade: grades.final,
                            })}
                          >
                            {grades.final}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="my-grades-score-button my-grades-final"
                            aria-label={`View ${subject.name} overall final grade details`}
                            onClick={() => setSelectedGrade({
                              subjectName: subject.name,
                              subjectCode: subject.code,
                              term: 'Overall final',
                              grade: finalGrade,
                            })}
                          >
                            {finalGrade}
                          </button>
                        </td>
                        <td><span className={`my-grades-result ${finalGrade >= 75 ? 'is-passed' : 'is-warning'}`}>{getGradeStatus(finalGrade)}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="my-grades-note">Grades shown here are for the selected current term. Contact the registrar if a subject or grade is missing.</p>
        </section>

        {selectedGrade && (
          <div
            className="my-grades-modal-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget) setSelectedGrade(null)
            }}
          >
            <section
              className="my-grades-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="my-grades-modal-title"
            >
              <div className="my-grades-modal-heading">
                <div>
                  <span>{selectedGrade.subjectCode} · {selectedGrade.term}</span>
                  <h2 id="my-grades-modal-title">Grade breakdown</h2>
                  <p>{selectedGrade.subjectName}</p>
                </div>
                <button
                  type="button"
                  className="my-grades-modal-close"
                  aria-label="Close grade breakdown"
                  onClick={() => setSelectedGrade(null)}
                >
                  ×
                </button>
              </div>
              <div className="my-grades-breakdown">
                <div className="my-grades-breakdown-header" aria-hidden="true">
                  <span>Component</span>
                  <span>Score</span>
                  <span>Weighted</span>
                </div>
                {gradeComponents.map((component) => (
                  <div className="my-grades-breakdown-row" key={component.label}>
                    <span>{component.label}<small>{component.weight}% of term grade</small></span>
                    <strong>{selectedGrade.grade}</strong>
                    <span className="my-grades-contribution">
                      {(selectedGrade.grade * component.weight / 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
                <div className="my-grades-term-grade">
                  <span>Term Grade</span>
                  <strong>{selectedGrade.grade}</strong>
                </div>
                <p className="my-grades-breakdown-note">
                  Component scores use the available sample term grade; separate component scores are not stored yet.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </SisLayout>
  )
}

export default MyGradesPage
