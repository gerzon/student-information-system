import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  initialAcademicLevels,
  type Section,
} from './AcademicData'
import { loadSubjectsForClass, type ManagedSubject } from './AcademicSubjects'
import {
  generateExamCode,
  getAllExams,
  removeExam as deleteExam,
  saveExam,
  type ExamRecord,
} from './ExamStorage'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './AcademicHierarchyPage.css'
import './StudentsExamPage.css'

const supportedExtensions = /\.(pdf|doc|docx|txt|rtf|ppt|pptx)$/i

function formatExamDate(value: string) {
  if (!value) return 'Date not set'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function StudentsExamPage() {
  const [levelId, setLevelId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [yearName, setYearName] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [examTitle, setExamTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [duration, setDuration] = useState('')
  const [questionsFile, setQuestionsFile] = useState<File | null>(null)
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null)
  const [createdExams, setCreatedExams] = useState<ExamRecord[]>([])
  const [formError, setFormError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)
  const [storageError, setStorageError] = useState('')
  const [subjectOptions, setSubjectOptions] = useState<ManagedSubject[]>([])
  const [subjectStorageError, setSubjectStorageError] = useState('')

  const selectedLevel = initialAcademicLevels.find((level) => level.id === levelId)
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
  const examsForSection = selectedSection
    ? createdExams.filter(
        (exam) =>
          exam.courseId === courseId &&
          exam.yearName === yearName &&
          exam.sectionName === selectedSection.name,
      )
    : []

  useEffect(() => {
    let cancelled = false
    getAllExams()
      .then((exams) => {
        if (!cancelled) setCreatedExams(exams)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStorageError(
            error instanceof Error ? error.message : 'Could not load saved exams.',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  function clearExamForm() {
    setExamTitle('')
    setSubject('')
    setExamDate('')
    setDuration('')
    setQuestionsFile(null)
    setAnswerKeyFile(null)
    setFormError('')
    setSavedNotice('')
    setFileInputKey((key) => key + 1)
    setSubjectOptions([])
    setSubjectStorageError('')
  }

  function selectLevel(nextLevelId: string) {
    setLevelId(nextLevelId)
    setDepartmentId('')
    setCourseId('')
    setYearName('')
    setSectionName('')
    clearExamForm()
  }

  function selectDepartment(nextDepartmentId: string) {
    setDepartmentId(nextDepartmentId)
    setCourseId('')
    setYearName('')
    setSectionName('')
    clearExamForm()
  }

  function selectCourse(nextCourseId: string) {
    setCourseId(nextCourseId)
    setYearName('')
    setSectionName('')
    clearExamForm()
  }

  function selectYear(nextYearName: string) {
    setYearName(nextYearName)
    setSectionName('')
    clearExamForm()
  }

  function selectSection(section: Section) {
    setSectionName(section.name)
    clearExamForm()
    if (selectedLevel && selectedCourse && selectedYear) {
      try {
        const result = loadSubjectsForClass({
          levelId: selectedLevel.id,
          courseId: selectedCourse.id,
          yearName: selectedYear.name,
          sectionName: section.name,
        })
        setSubjectOptions(result.subjects)
        setSubjectStorageError('')
      } catch (error: unknown) {
        setSubjectOptions([])
        setSubjectStorageError(error instanceof Error ? error.message : 'Could not load this class’s subjects.')
      }
    }
  }

  function selectSectionName(nextSectionName: string) {
    setSectionName(nextSectionName)
    clearExamForm()
  }

  async function handleExamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedLevel || !selectedDepartment || !selectedCourse || !selectedYear || !selectedSection) {
      setFormError('Select a complete class hierarchy before creating an exam.')
      return
    }
    if (!examTitle.trim() || !subject) {
      setFormError(
        subjectOptions.length
          ? 'Enter an exam title and choose a subject.'
          : 'Add a subject to this class before creating an exam.',
      )
      return
    }
    if (subjectStorageError) {
      setFormError('Resolve the subject catalog error before creating an exam.')
      return
    }
    if (
      (questionsFile && !supportedExtensions.test(questionsFile.name)) ||
      (answerKeyFile && !supportedExtensions.test(answerKeyFile.name))
    ) {
      setFormError('Use PDF, Word, text, RTF, or PowerPoint files for exam materials.')
      return
    }

    try {
      const createdExam: ExamRecord = {
        code: await generateExamCode(),
        levelName: selectedLevel.name,
        departmentName: selectedDepartment.name,
        courseId,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        yearName,
        sectionName: selectedSection.name,
        title: examTitle.trim(),
        subject,
        examDate,
        duration: duration.trim(),
        questionsFileName: questionsFile?.name ?? '',
        questionsFileType: questionsFile?.type ?? '',
        questionsFile,
        answerKeyFileName: answerKeyFile?.name ?? '',
        answerKeyFile,
        createdAt: new Date().toISOString(),
      }
      await saveExam(createdExam)
      setCreatedExams((exams) => [...exams, createdExam])
      setSavedNotice(`“${createdExam.title}” was added for ${selectedSection.name}. Exam code: ${createdExam.code}`)
      setFormError('')
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Could not save this exam.')
      return
    }
    setExamTitle('')
    setSubject('')
    setExamDate('')
    setDuration('')
    setQuestionsFile(null)
    setAnswerKeyFile(null)
    setFileInputKey((key) => key + 1)
  }

  async function removeExam(code: string) {
    try {
      await deleteExam(code)
      setCreatedExams((exams) => exams.filter((exam) => exam.code !== code))
      setStorageError('')
    } catch (error: unknown) {
      setStorageError(error instanceof Error ? error.message : 'Could not remove this exam.')
    }
  }

  return (
    <SisLayout
      active="Student's Exam"
      breadcrumb="Exam Management"
      breadcrumbRoot="Student's Exam"
      breadcrumbHref="#student's%20exam"
      title="Student's Exam"
      subtitle="Select a class, then create an exam and attach its questions and answer key."
      icon="studentsexam"
    >
      <div className="academic-hierarchy students-exam-page">
        <div className="academic-hierarchy-notice">
          <strong>Local preview:</strong> exam records and selected files are
          stored in this browser only and are not sent to a server.
        </div>

        <section className="academic-hierarchy-panel" aria-labelledby="exam-hierarchy-title">
          <div className="academic-hierarchy-heading">
            <div>
              <h2 id="exam-hierarchy-title">Choose the class for this exam</h2>
              <p>
                Education level <span>›</span> Department <span>›</span> Course
                <span> › </span> Year level <span>›</span> Section
              </p>
            </div>
          </div>

          <nav className="academic-breadcrumb" aria-label="Selected class hierarchy">
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
            {selectedYear && (
              <>
                <span aria-hidden="true">›</span>
                <button
                  type="button"
                  className={!selectedSection ? 'is-current' : ''}
                  onClick={() => selectSectionName('')}
                >
                  {selectedYear.name}
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
              description="Choose tertiary or secondary education."
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
                    <span><strong>{level.name}</strong><small>{level.description}</small></span>
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
                    <span className="hierarchy-choice-icon is-department"><SisIcon name="courses" /></span>
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

          {selectedCourse && !selectedYear && (
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
                    <span className="hierarchy-year-icon"><SisIcon name="calendar" /></span>
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

          {selectedYear && !selectedSection && (
            <HierarchyStep
              title="5. Choose a section"
              description={`Sections in ${selectedCourse?.code} · ${selectedYear.name}.`}
            >
              {selectedYear.sections.length ? (
                <div className="hierarchy-section-list">
                  {selectedYear.sections.map((section) => (
                    <button
                      className="hierarchy-section-card students-exam-section"
                      type="button"
                      key={section.name}
                      onClick={() => selectSection(section)}
                    >
                      <span className="hierarchy-section-icon"><SisIcon name="sections" /></span>
                      <span className="hierarchy-section-main">
                        <strong>{section.name}</strong><span>{section.adviser}</span>
                      </span>
                      <span className="hierarchy-section-detail">
                        <small>Room</small><span>{section.room}</span>
                      </span>
                      <span className="hierarchy-section-detail">
                        <small>Schedule</small><span>{section.schedule}</span>
                      </span>
                      <span className="hierarchy-choice-arrow" aria-hidden="true">›</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="hierarchy-empty">No sections are available for this year level.</p>
              )}
            </HierarchyStep>
          )}

          {selectedSection && selectedCourse && selectedLevel && (
            <section className="exam-workspace" aria-labelledby="exam-workspace-title">
              <div className="exam-selected-class">
                <span className="exam-class-icon"><SisIcon name="studentsexam" /></span>
                <div>
                  <small>Selected class</small>
                  <strong>{selectedCourse.code} · {selectedYear?.name} · {selectedSection.name}</strong>
                  <span>{selectedLevel.name} · {selectedDepartment?.name}</span>
                </div>
                <button type="button" onClick={() => selectSectionName('')}>Change section</button>
              </div>

              <div className="exam-workspace-heading">
                <h3 id="exam-workspace-title">Create an exam</h3>
                <p>Enter exam details and optionally attach questions and an answer key.</p>
              </div>

              <form className="exam-form" onSubmit={handleExamSubmit}>
                <div className="exam-form-fields">
                  <label>
                    Exam title <span>*</span>
                    <input
                      value={examTitle}
                      onChange={(event) => setExamTitle(event.currentTarget.value)}
                      maxLength={100}
                      placeholder="e.g. Midterm Examination"
                      required
                    />
                  </label>
                  <label>
                    Subject <span>*</span>
                    <select
                      value={subject}
                      onChange={(event) => setSubject(event.currentTarget.value)}
                      disabled={Boolean(subjectStorageError) || subjectOptions.length === 0}
                      required
                    >
                      <option value="">Select subject</option>
                      {subjectOptions.map((item) => <option key={item.id} value={item.name}>{item.code} — {item.name}</option>)}
                    </select>
                  </label>
                  <label>
                    Exam date
                    <input
                      type="date"
                      value={examDate}
                      onChange={(event) => setExamDate(event.currentTarget.value)}
                    />
                  </label>
                  <label>
                    Duration (minutes)
                    <input
                      type="number"
                      min="1"
                      max="600"
                      value={duration}
                      onChange={(event) => setDuration(event.currentTarget.value)}
                      placeholder="e.g. 90"
                    />
                  </label>
                </div>

                <div className="exam-upload-grid">
                  <label className="exam-upload-card">
                    <span className="exam-upload-icon"><SisIcon name="reports" /></span>
                    <span className="exam-upload-copy">
                      <strong>Questions</strong>
                      <small>{questionsFile?.name ?? 'Attach the exam questions (optional)'}</small>
                    </span>
                    <span className="exam-upload-action">Choose file</span>
                    <input
                      key={`questions-${fileInputKey}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx"
                      onChange={(event) => {
                        setQuestionsFile(event.currentTarget.files?.[0] ?? null)
                        setFormError('')
                      }}
                    />
                  </label>
                  <label className="exam-upload-card">
                    <span className="exam-upload-icon is-answer"><SisIcon name="shield" /></span>
                    <span className="exam-upload-copy">
                      <strong>Answer key</strong>
                      <small>{answerKeyFile?.name ?? 'Attach the answer key (optional)'}</small>
                    </span>
                    <span className="exam-upload-action">Choose file</span>
                    <input
                      key={`answer-key-${fileInputKey}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx"
                      onChange={(event) => {
                        setAnswerKeyFile(event.currentTarget.files?.[0] ?? null)
                        setFormError('')
                      }}
                    />
                  </label>
                </div>
                {subjectStorageError && <p className="exam-form-error" role="alert">{subjectStorageError}</p>}
                {!subjectStorageError && selectedSection && subjectOptions.length === 0 && (
                  <p className="exam-form-hint">
                    No subjects are configured for this class. <a href="#subjects">Manage class subjects</a>.
                  </p>
                )}
                {formError && <p className="exam-form-error" role="alert">{formError}</p>}
                {savedNotice && <p className="exam-saved-notice" role="status">{savedNotice}</p>}
                {storageError && <p className="exam-form-error" role="alert">{storageError}</p>}
                <p className="exam-form-note">
                  Create the exam with details alone or attach either/both files.
                  Text question files are shuffled after students leave the exam tab.
                </p>
                <div className="exam-form-actions">
                  <button type="button" className="exam-clear-button" onClick={clearExamForm}>Clear</button>
                  <button type="submit" className="exam-create-button">Create exam</button>
                </div>
              </form>

              <div className="exam-list">
                <div className="exam-list-heading">
                  <h3>Exams for {selectedSection.name}</h3>
                  <span>{examsForSection.length}</span>
                </div>
                {examsForSection.length ? (
                  <ul>
                    {examsForSection.map((exam) => (
                      <li key={exam.code}>
                        <div>
                          <strong>{exam.title}</strong>
                          <span className="exam-code-label">Exam code: <strong>{exam.code}</strong></span>
                          <span>{exam.subject} · {formatExamDate(exam.examDate)}{exam.duration ? ` · ${exam.duration} min` : ''}</span>
                          <small>
                            Questions: {exam.questionsFileName || 'Not attached'} · Answer key: {exam.answerKeyFileName || 'Not attached'}
                          </small>
                        </div>
                        <button type="button" onClick={() => void removeExam(exam.code)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="exam-list-empty">No exams have been created for this class yet.</p>
                )}
              </div>
            </section>
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

export default StudentsExamPage
