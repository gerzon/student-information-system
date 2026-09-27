import { useMemo, useRef, useState } from 'react'
import {
  initialAcademicLevels,
  secondarySubjects,
  tertiarySubjects,
} from './AcademicData'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './EmployeeDirectory.css'

type EmployeeType = 'Faculty' | 'Staff'
type EmployeeStatus = 'Active' | 'On Leave'
type Employee = {
  employeeId: string
  name: string
  type: EmployeeType
  department: string
  position: string
  email: string
  status: EmployeeStatus
}
type SubjectAssignment = {
  id: string
  levelId: string
  departmentId: string
  courseId: string
  yearName: string
  sectionName: string
  subject: string
}

const employees: Employee[] = [
  {
    employeeId: 'EMP-00018',
    name: 'Maria Lourdes Santos',
    type: 'Faculty',
    department: 'College of Education',
    position: 'Senior Instructor',
    email: 'ml.santos@papsi.edu.ph',
    status: 'Active',
  },
  {
    employeeId: 'EMP-00024',
    name: 'Roberto Villanueva',
    type: 'Faculty',
    department: 'Information Technology',
    position: 'Program Coordinator',
    email: 'r.villanueva@papsi.edu.ph',
    status: 'Active',
  },
  {
    employeeId: 'EMP-00031',
    name: 'Catherine Dizon',
    type: 'Faculty',
    department: 'College of Business',
    position: 'Instructor',
    email: 'c.dizon@papsi.edu.ph',
    status: 'On Leave',
  },
  {
    employeeId: 'EMP-00037',
    name: 'Paolo Miguel Reyes',
    type: 'Faculty',
    department: 'Arts and Sciences',
    position: 'Instructor',
    email: 'pm.reyes@papsi.edu.ph',
    status: 'Active',
  },
  {
    employeeId: 'EMP-00042',
    name: 'Angela Mae Flores',
    type: 'Staff',
    department: "Registrar's Office",
    position: 'Registrar Assistant',
    email: 'a.flores@papsi.edu.ph',
    status: 'Active',
  },
  {
    employeeId: 'EMP-00049',
    name: 'Josephine Cruz',
    type: 'Staff',
    department: 'Library',
    position: 'Librarian',
    email: 'j.cruz@papsi.edu.ph',
    status: 'Active',
  },
  {
    employeeId: 'EMP-00056',
    name: 'Mark Anthony Garcia',
    type: 'Staff',
    department: 'Administration',
    position: 'Administrative Assistant',
    email: 'ma.garcia@papsi.edu.ph',
    status: 'On Leave',
  },
  {
    employeeId: 'EMP-00063',
    name: 'Rhea Ann Mendoza',
    type: 'Staff',
    department: 'Student Services',
    position: 'Student Affairs Officer',
    email: 'r.mendoza@papsi.edu.ph',
    status: 'Active',
  },
]

const typeFilters = ['All', 'Faculty', 'Staff'] as const
type TypeFilter = (typeof typeFilters)[number]
const statusFilters = ['All', 'Active', 'On Leave'] as const
type StatusFilter = (typeof statusFilters)[number]

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

function EmployeeDirectory() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [search, setSearch] = useState('')
  const [subjectAssignments, setSubjectAssignments] = useState<
    Record<string, SubjectAssignment[]>
  >({})
  const [editingEmployeeId, setEditingEmployeeId] = useState('')
  const [assignmentLevelId, setAssignmentLevelId] = useState('')
  const [assignmentDepartmentId, setAssignmentDepartmentId] = useState('')
  const [assignmentCourseId, setAssignmentCourseId] = useState('')
  const [assignmentYearName, setAssignmentYearName] = useState('')
  const [assignmentSectionName, setAssignmentSectionName] = useState('')
  const [assignmentSubject, setAssignmentSubject] = useState('')
  const [editingAssignmentId, setEditingAssignmentId] = useState('')
  const [assignmentError, setAssignmentError] = useState('')
  const assignmentSequence = useRef(0)

  const editingEmployee = employees.find(
    (employee) => employee.employeeId === editingEmployeeId,
  )
  const assignmentLevel = initialAcademicLevels.find(
    (level) => level.id === assignmentLevelId,
  )
  const assignmentDepartment = assignmentLevel?.departments.find(
    (department) => department.id === assignmentDepartmentId,
  )
  const assignmentCourse = assignmentDepartment?.courses.find(
    (course) => course.id === assignmentCourseId,
  )
  const assignmentYear = assignmentCourse?.yearGroups.find(
    (yearGroup) => yearGroup.name === assignmentYearName,
  )
  const assignmentSubjects = assignmentLevel?.id === 'secondary'
    ? secondarySubjects
    : tertiarySubjects
  const employeeAssignments = subjectAssignments[editingEmployeeId] ?? []

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()

    return employees.filter((employee) => {
      const matchesType =
        typeFilter === 'All' || employee.type === typeFilter
      const matchesStatus =
        statusFilter === 'All' || employee.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        [
          employee.employeeId,
          employee.name,
          employee.department,
          employee.position,
          employee.email,
        ].some((value) => value.toLowerCase().includes(query))

      return matchesType && matchesStatus && matchesSearch
    })
  }, [search, statusFilter, typeFilter])

  const facultyCount = employees.filter(
    (employee) => employee.type === 'Faculty',
  ).length
  const staffCount = employees.filter(
    (employee) => employee.type === 'Staff',
  ).length

  function openSubjectEditor(employee: Employee) {
    setEditingEmployeeId(employee.employeeId)
    setAssignmentLevelId('')
    setAssignmentDepartmentId('')
    setAssignmentCourseId('')
    setAssignmentYearName('')
    setAssignmentSectionName('')
    setAssignmentSubject('')
    setEditingAssignmentId('')
    setAssignmentError('')
  }

  function closeSubjectEditor() {
    setEditingEmployeeId('')
    setAssignmentError('')
  }

  function editAssignment(assignment: SubjectAssignment) {
    setAssignmentLevelId(assignment.levelId)
    setAssignmentDepartmentId(assignment.departmentId)
    setAssignmentCourseId(assignment.courseId)
    setAssignmentYearName(assignment.yearName)
    setAssignmentSectionName(assignment.sectionName)
    setAssignmentSubject(assignment.subject)
    setEditingAssignmentId(assignment.id)
    setAssignmentError('')
  }

  function saveSubjectAssignment() {
    if (
      !editingEmployeeId ||
      !assignmentLevel ||
      !assignmentDepartment ||
      !assignmentCourse ||
      !assignmentYear ||
      !assignmentSectionName ||
      !assignmentSubject
    ) {
      setAssignmentError('Choose an education level, program, class, and subject.')
      return
    }

    const currentAssignments = subjectAssignments[editingEmployeeId] ?? []
    const duplicateAssignment = currentAssignments.some((assignment) =>
      assignment.id !== editingAssignmentId &&
      assignment.courseId === assignmentCourseId &&
      assignment.yearName === assignmentYearName &&
      assignment.sectionName === assignmentSectionName &&
      assignment.subject === assignmentSubject,
    )
    if (duplicateAssignment) {
      setAssignmentError('This subject is already assigned to this employee for the selected class.')
      return
    }

    const assignment: SubjectAssignment = {
      id: editingAssignmentId || `${editingEmployeeId}-${++assignmentSequence.current}`,
      levelId: assignmentLevelId,
      departmentId: assignmentDepartmentId,
      courseId: assignmentCourseId,
      yearName: assignmentYearName,
      sectionName: assignmentSectionName,
      subject: assignmentSubject,
    }
    setSubjectAssignments((current) => {
      const employeeAssignments = current[editingEmployeeId] ?? []
      return {
        ...current,
        [editingEmployeeId]: editingAssignmentId
          ? employeeAssignments.map((item) =>
              item.id === editingAssignmentId ? assignment : item,
            )
          : [...employeeAssignments, assignment],
      }
    })
    setEditingAssignmentId('')
    setAssignmentLevelId('')
    setAssignmentDepartmentId('')
    setAssignmentCourseId('')
    setAssignmentYearName('')
    setAssignmentSectionName('')
    setAssignmentSubject('')
    setAssignmentError('')
  }

  function removeAssignment(assignmentId: string) {
    setSubjectAssignments((current) => ({
      ...current,
      [editingEmployeeId]: (current[editingEmployeeId] ?? []).filter(
        (assignment) => assignment.id !== assignmentId,
      ),
    }))
    if (editingAssignmentId === assignmentId) {
      setEditingAssignmentId('')
      setAssignmentLevelId('')
      setAssignmentDepartmentId('')
      setAssignmentCourseId('')
      setAssignmentYearName('')
      setAssignmentSectionName('')
      setAssignmentSubject('')
    }
  }

  return (
    <SisLayout
      active="Faculty & Staff"
      breadcrumb="Employee Directory"
      breadcrumbRoot="Users"
      breadcrumbHref="#users"
      title="Faculty & Staff"
      subtitle="Browse faculty members and staff employees."
      icon="users"
    >
      <div className="employee-directory">
        <div className="employee-directory-notice">
          <strong>Sample data:</strong> employee records are for UI preview only
          and are not connected to the employee database.
        </div>

        <section className="employee-summary-grid" aria-label="Employee totals">
          <article className="employee-summary-card">
            <span className="employee-summary-icon is-blue">
              <SisIcon name="users" />
            </span>
            <span>
              <small>Total employees</small>
              <strong>{employees.length}</strong>
            </span>
          </article>
          <article className="employee-summary-card">
            <span className="employee-summary-icon is-violet">
              <SisIcon name="courses" />
            </span>
            <span>
              <small>Faculty</small>
              <strong>{facultyCount}</strong>
            </span>
          </article>
          <article className="employee-summary-card">
            <span className="employee-summary-icon is-green">
              <SisIcon name="reports" />
            </span>
            <span>
              <small>Staff</small>
              <strong>{staffCount}</strong>
            </span>
          </article>
        </section>

        <section className="employee-directory-panel" aria-labelledby="employee-list-title">
          <div className="employee-directory-heading">
            <div>
              <h2 id="employee-list-title">Employee list</h2>
              <p>Search employees, then select a row to add or update enrolled subjects.</p>
            </div>
            <a className="employee-add-button" href="#users/register">
              <SisIcon name="user" />
              Register employee
            </a>
          </div>

          <div className="employee-directory-controls">
            <div className="employee-type-filters" aria-label="Filter by employee type">
              {typeFilters.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`employee-filter-button${typeFilter === type ? ' is-active' : ''}`}
                  aria-pressed={typeFilter === type}
                  onClick={() => setTypeFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="employee-search-controls">
              <label className="employee-search" htmlFor="employee-search">
                <SisIcon name="users" />
                <input
                  id="employee-search"
                  type="search"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="employee-status-filter">
                <span className="visually-hidden">Filter by employee status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    const value = statusFilters.find(
                      (status) => status === event.currentTarget.value,
                    )
                    if (value) setStatusFilter(value)
                  }}
                >
                  {statusFilters.map((status) => (
                    <option value={status} key={status}>
                      {status === 'All' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <p className="employee-results-count" aria-live="polite">
            Showing {filteredEmployees.length} of {employees.length} sample employees
          </p>

          <div className="employee-table-wrap">
            <table className="employee-table">
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Type</th>
                  <th scope="col">Department</th>
                  <th scope="col">Position</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Status</th>
                  <th scope="col">Enrolled subjects</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.employeeId}
                    className="employee-clickable-row"
                    onClick={() => openSubjectEditor(employee)}
                  >
                    <td>
                      <span className="employee-name-cell">
                        <span className="employee-list-avatar" aria-hidden="true">
                          {initials(employee.name)}
                        </span>
                        <span>
                          <strong>{employee.name}</strong>
                          <small>{employee.employeeId}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className={`employee-type-label is-${employee.type.toLowerCase()}`}>
                        {employee.type}
                      </span>
                    </td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>{employee.email}</td>
                    <td>
                      <span className={`employee-status is-${employee.status.toLowerCase().replaceAll(' ', '-')}`}>
                        <span />
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="employee-subject-action"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          openSubjectEditor(employee)
                        }}
                      >
                        {subjectAssignments[employee.employeeId]?.length ?? 0} assigned
                        <span aria-hidden="true"> · Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td className="employee-empty-cell" colSpan={7}>
                      <strong>No employees found</strong>
                      <span>Try another search term or filter.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editingEmployee && (
        <div
          className="employee-subject-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSubjectEditor()
          }}
        >
          <section
            className="employee-subject-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-subject-title"
          >
            <div className="employee-subject-dialog-heading">
              <div>
                <h2 id="employee-subject-title">Enrolled subjects</h2>
                <p>{editingEmployee.name} · {editingEmployee.type} · {editingEmployee.employeeId}</p>
              </div>
              <button
                className="employee-subject-close"
                type="button"
                aria-label="Close subject editor"
                onClick={closeSubjectEditor}
              >
                ×
              </button>
            </div>

            <p className="employee-subject-hint">
              Select a class through the academic hierarchy, then assign a subject.
              Assignments are a UI preview and are kept only while this page is open.
            </p>

            <div className="employee-subject-form">
              <label>
                Education level
                <select
                  value={assignmentLevelId}
                  onChange={(event) => {
                    setAssignmentLevelId(event.currentTarget.value)
                    setAssignmentDepartmentId('')
                    setAssignmentCourseId('')
                    setAssignmentYearName('')
                    setAssignmentSectionName('')
                    setAssignmentSubject('')
                  }}
                >
                  <option value="">Select education level</option>
                  {initialAcademicLevels.map((level) => (
                    <option value={level.id} key={level.id}>{level.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Department
                <select
                  value={assignmentDepartmentId}
                  disabled={!assignmentLevel}
                  onChange={(event) => {
                    setAssignmentDepartmentId(event.currentTarget.value)
                    setAssignmentCourseId('')
                    setAssignmentYearName('')
                    setAssignmentSectionName('')
                    setAssignmentSubject('')
                  }}
                >
                  <option value="">Select department</option>
                  {assignmentLevel?.departments.map((department) => (
                    <option value={department.id} key={department.id}>{department.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Course or strand
                <select
                  value={assignmentCourseId}
                  disabled={!assignmentDepartment}
                  onChange={(event) => {
                    setAssignmentCourseId(event.currentTarget.value)
                    setAssignmentYearName('')
                    setAssignmentSectionName('')
                    setAssignmentSubject('')
                  }}
                >
                  <option value="">Select course or strand</option>
                  {assignmentDepartment?.courses.map((course) => (
                    <option value={course.id} key={course.id}>{course.code} — {course.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Year level
                <select
                  value={assignmentYearName}
                  disabled={!assignmentCourse}
                  onChange={(event) => {
                    setAssignmentYearName(event.currentTarget.value)
                    setAssignmentSectionName('')
                  }}
                >
                  <option value="">Select year level</option>
                  {assignmentCourse?.yearGroups.map((yearGroup) => (
                    <option value={yearGroup.name} key={yearGroup.name}>{yearGroup.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Section
                <select
                  value={assignmentSectionName}
                  disabled={!assignmentYear}
                  onChange={(event) => setAssignmentSectionName(event.currentTarget.value)}
                >
                  <option value="">Select section</option>
                  {assignmentYear?.sections.map((section) => (
                    <option value={section.name} key={section.name}>{section.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Subject
                <select
                  value={assignmentSubject}
                  disabled={!assignmentSectionName}
                  onChange={(event) => setAssignmentSubject(event.currentTarget.value)}
                >
                  <option value="">Select subject</option>
                  {assignmentSubjects.map((subject) => (
                    <option value={subject} key={subject}>{subject}</option>
                  ))}
                </select>
              </label>
            </div>

            {assignmentError && <p className="employee-subject-error" role="alert">{assignmentError}</p>}

            <div className="employee-subject-form-actions">
              {editingAssignmentId && (
                <button
                  className="employee-subject-cancel"
                  type="button"
                  onClick={() => {
                    setEditingAssignmentId('')
                    setAssignmentLevelId('')
                    setAssignmentDepartmentId('')
                    setAssignmentCourseId('')
                    setAssignmentYearName('')
                    setAssignmentSectionName('')
                    setAssignmentSubject('')
                    setAssignmentError('')
                  }}
                >
                  Cancel update
                </button>
              )}
              <button className="employee-subject-save" type="button" onClick={saveSubjectAssignment}>
                {editingAssignmentId ? 'Update subject' : 'Add subject'}
              </button>
            </div>

            <section className="employee-subject-list" aria-labelledby="employee-assignment-list-title">
              <h3 id="employee-assignment-list-title">
                Assigned subjects <span>{employeeAssignments.length}</span>
              </h3>
              {employeeAssignments.length ? (
                <ul>
                  {employeeAssignments.map((assignment) => {
                    const level = initialAcademicLevels.find((item) => item.id === assignment.levelId)
                    const department = level?.departments.find((item) => item.id === assignment.departmentId)
                    const course = department?.courses.find((item) => item.id === assignment.courseId)
                    return (
                      <li key={assignment.id}>
                        <div>
                          <strong>{assignment.subject}</strong>
                          <span>{course?.code} · {assignment.yearName} · {assignment.sectionName}</span>
                          <small>{level?.name} · {department?.name}</small>
                        </div>
                        <div className="employee-assignment-actions">
                          <button type="button" onClick={() => editAssignment(assignment)}>Edit</button>
                          <button type="button" onClick={() => removeAssignment(assignment.id)}>Remove</button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="employee-subject-empty">No subjects assigned to this employee yet.</p>
              )}
            </section>
          </section>
        </div>
      )}
    </SisLayout>
  )
}

export default EmployeeDirectory
