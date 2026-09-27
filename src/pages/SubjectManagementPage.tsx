import { useState, type FormEvent } from 'react'
import { initialAcademicLevels } from './AcademicData'
import {
  loadSubjectsForClass,
  saveSubjectsForClass,
  type ManagedSubject,
} from './AcademicSubjects'
import SisLayout from './SisLayout'
import './SubjectManagementPage.css'

function SubjectManagementPage() {
  const [levelId, setLevelId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [yearName, setYearName] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [subjects, setSubjects] = useState<ManagedSubject[]>([])
  const [isCustomized, setIsCustomized] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [notice, setNotice] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubjectId, setEditingSubjectId] = useState('')
  const [formError, setFormError] = useState('')

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
  const editingSubject = subjects.find((subject) => subject.id === editingSubjectId)

  function persistSubjects(nextSubjects: ManagedSubject[]) {
    if (!selectedLevel || !selectedCourse || !selectedYear || !selectedSection) return false

    try {
      saveSubjectsForClass(
        {
          levelId: selectedLevel.id,
          courseId: selectedCourse.id,
          yearName: selectedYear.name,
          sectionName: selectedSection.name,
        },
        nextSubjects,
      )
      setSubjects(nextSubjects)
      setIsCustomized(true)
      setStorageError('')
      setNotice(`Subject list saved for ${selectedSection.name}.`)
      setFormError('')
      return true
    } catch (error: unknown) {
      setStorageError(error instanceof Error ? error.message : 'Could not save subjects.')
      return false
    }
  }

  function openSubjectDialog(subject?: ManagedSubject) {
    setEditingSubjectId(subject?.id ?? '')
    setFormError('')
    setNotice('')
    setDialogOpen(true)
  }

  function handleSubjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const code = String(formData.get('code') ?? '').trim().toUpperCase()
    const name = String(formData.get('name') ?? '').trim()
    const units = Number(formData.get('units'))

    if (!code || !name || !Number.isFinite(units) || units <= 0) {
      setFormError('Enter a subject code, name, and valid unit value.')
      return
    }
    if (subjects.some((subject) =>
      subject.id !== editingSubjectId &&
      (subject.code.toLowerCase() === code.toLowerCase() ||
        subject.name.toLowerCase() === name.toLowerCase()),
    )) {
      setFormError('Subject codes and names must be unique within this class.')
      return
    }

    const updatedSubject: ManagedSubject = {
      id: editingSubject?.id ?? `subject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      code,
      name,
      units,
    }
    const nextSubjects = editingSubject
      ? subjects.map((subject) => subject.id === editingSubject.id ? updatedSubject : subject)
      : [...subjects, updatedSubject]

    if (persistSubjects(nextSubjects)) setDialogOpen(false)
  }

  function removeSubject(subject: ManagedSubject) {
    if (!window.confirm(`Remove ${subject.code} — ${subject.name} from ${selectedSection?.name}?`)) {
      return
    }
    persistSubjects(subjects.filter((item) => item.id !== subject.id))
  }

  function resetAfterLevelChange(value: string) {
    setLevelId(value)
    setDepartmentId('')
    setCourseId('')
    setYearName('')
    setSectionName('')
    setSubjects([])
    setIsCustomized(false)
    setStorageError('')
    setNotice('')
  }

  function resetAfterDepartmentChange(value: string) {
    setDepartmentId(value)
    setCourseId('')
    setYearName('')
    setSectionName('')
    setSubjects([])
    setIsCustomized(false)
    setStorageError('')
    setNotice('')
  }

  function resetAfterCourseChange(value: string) {
    setCourseId(value)
    setYearName('')
    setSectionName('')
    setSubjects([])
    setIsCustomized(false)
    setStorageError('')
    setNotice('')
  }

  function selectYear(value: string) {
    setYearName(value)
    setSectionName('')
    setSubjects([])
    setIsCustomized(false)
    setStorageError('')
    setNotice('')
  }

  function selectSection(value: string) {
    setSectionName(value)
    setNotice('')
    if (!selectedLevel || !selectedCourse || !selectedYear || !value) {
      setSubjects([])
      setIsCustomized(false)
      setStorageError('')
      return
    }

    try {
      const result = loadSubjectsForClass({
        levelId: selectedLevel.id,
        courseId: selectedCourse.id,
        yearName: selectedYear.name,
        sectionName: value,
      })
      setSubjects(result.subjects)
      setIsCustomized(result.isCustomized)
      setStorageError('')
    } catch (error: unknown) {
      setSubjects([])
      setIsCustomized(false)
      setStorageError(error instanceof Error ? error.message : 'Could not load subjects.')
    }
  }

  return (
    <SisLayout
      active="Subjects"
      breadcrumb="Subject Management"
      breadcrumbRoot="Subjects"
      breadcrumbHref="#subjects"
      title="Subject Management"
      subtitle="Organize the subjects assigned to each class through the educational hierarchy."
      icon="courses"
    >
      <div className="subject-management">
        <div className="subject-management-notice">
          <strong>Browser storage:</strong> custom subject lists are saved on this device.
          Classes without a custom list start with the standard subjects for their education level.
        </div>

        <section className="subject-panel" aria-labelledby="subject-hierarchy-title">
          <div className="subject-panel-heading">
            <div>
              <h2 id="subject-hierarchy-title">Select a class</h2>
              <p>Follow the hierarchy to manage one section’s subject list.</p>
            </div>
          </div>
          <nav className="subject-breadcrumb" aria-label="Selected subject hierarchy">
            <span className={!selectedLevel ? 'is-current' : ''}>Education level</span>
            {selectedLevel && <><span aria-hidden="true">›</span><span className={!selectedDepartment ? 'is-current' : ''}>{selectedLevel.name}</span></>}
            {selectedDepartment && <><span aria-hidden="true">›</span><span className={!selectedCourse ? 'is-current' : ''}>{selectedDepartment.name}</span></>}
            {selectedCourse && <><span aria-hidden="true">›</span><span className={!selectedYear ? 'is-current' : ''}>{selectedCourse.code}</span></>}
            {selectedYear && <><span aria-hidden="true">›</span><span className={!selectedSection ? 'is-current' : ''}>{selectedYear.name}</span></>}
            {selectedSection && <><span aria-hidden="true">›</span><span className="is-current">{selectedSection.name}</span></>}
          </nav>
          <div className="subject-hierarchy-controls">
            <label>
              Education level
              <select value={levelId} onChange={(event) => resetAfterLevelChange(event.currentTarget.value)}>
                <option value="">Select education level</option>
                {initialAcademicLevels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
              </select>
            </label>
            <label>
              Department
              <select value={departmentId} disabled={!selectedLevel} onChange={(event) => resetAfterDepartmentChange(event.currentTarget.value)}>
                <option value="">Select department</option>
                {selectedLevel?.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
            </label>
            <label>
              Course or strand
              <select value={courseId} disabled={!selectedDepartment} onChange={(event) => resetAfterCourseChange(event.currentTarget.value)}>
                <option value="">Select course or strand</option>
                {selectedDepartment?.courses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.name}</option>)}
              </select>
            </label>
            <label>
              Year level
              <select value={yearName} disabled={!selectedCourse} onChange={(event) => {
                selectYear(event.currentTarget.value)
              }}>
                <option value="">Select year level</option>
                {selectedCourse?.yearGroups.map((year) => <option key={year.name} value={year.name}>{year.name}</option>)}
              </select>
            </label>
            <label>
              Section
              <select value={sectionName} disabled={!selectedYear} onChange={(event) => {
                selectSection(event.currentTarget.value)
              }}>
                <option value="">Select section</option>
                {selectedYear?.sections.map((section) => <option key={section.name} value={section.name}>{section.name}</option>)}
              </select>
            </label>
          </div>
        </section>

        {selectedSection && (
          <section className="subject-panel" aria-labelledby="subject-list-title">
            <div className="subject-list-heading">
              <div>
                <h2 id="subject-list-title">Subjects for {selectedSection.name}</h2>
                <p>
                  {selectedCourse?.code} · {selectedYear?.name}
                  {isCustomized ? ' · Custom class list' : ' · Standard level defaults'}
                </p>
              </div>
              <button className="subject-add-button" type="button" onClick={() => openSubjectDialog()}>
                <span aria-hidden="true">+</span> Add subject
              </button>
            </div>

            {storageError && <p className="subject-feedback is-error" role="alert">{storageError}</p>}
            {notice && !storageError && <p className="subject-feedback" role="status">{notice}</p>}
            <div className="subject-table-wrap">
              <table className="subject-table">
                <thead>
                  <tr><th scope="col">Subject code</th><th scope="col">Subject name</th><th scope="col">Units</th><th scope="col">Actions</th></tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td><span className="subject-code">{subject.code}</span></td>
                      <td>{subject.name}</td>
                      <td>{subject.units}</td>
                      <td>
                        <div className="subject-row-actions">
                          <button type="button" onClick={() => openSubjectDialog(subject)}>Edit</button>
                          <button type="button" className="is-danger" onClick={() => removeSubject(subject)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subjects.length === 0 && (
                    <tr><td className="subject-empty" colSpan={4}>No subjects are assigned to this class. Add one to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {dialogOpen && (
        <div className="subject-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialogOpen(false)
        }}>
          <section className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="subject-dialog-title">
            <div className="subject-modal-heading">
              <div>
                <h2 id="subject-dialog-title">{editingSubject ? 'Edit subject' : 'Add subject'}</h2>
                <p>{selectedSection?.name} · {selectedCourse?.code}</p>
              </div>
              <button type="button" aria-label="Close dialog" onClick={() => setDialogOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubjectSubmit}>
              <div className="subject-form-fields">
                <label>Subject code<input name="code" defaultValue={editingSubject?.code} maxLength={20} required /></label>
                <label>Subject name<input name="name" defaultValue={editingSubject?.name} maxLength={100} required /></label>
                <label>Units<input name="units" type="number" min="0.5" max="30" step="0.5" defaultValue={editingSubject?.units ?? 3} required /></label>
              </div>
              {formError && <p className="subject-feedback is-error" role="alert">{formError}</p>}
              <div className="subject-modal-actions">
                <button type="button" className="subject-cancel-button" onClick={() => setDialogOpen(false)}>Cancel</button>
                <button type="submit" className="subject-add-button">{editingSubject ? 'Save changes' : 'Add subject'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </SisLayout>
  )
}

export default SubjectManagementPage
