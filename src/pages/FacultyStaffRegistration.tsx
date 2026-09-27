import { useState, type FormEvent } from 'react'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './FacultyStaffRegistration.css'

function FacultyStaffRegistration() {
  const [notice, setNotice] = useState('')
  const [personType, setPersonType] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(
      'Preview only: no account was created and no invitation was sent.',
    )
  }

  return (
    <SisLayout
      active="Faculty & Staff"
      breadcrumb="Register Faculty or Staff"
      breadcrumbRoot="Users"
      breadcrumbHref="#users"
      title="Faculty & Staff Registration"
      subtitle="Create an account for a faculty member or staff employee."
      icon="users"
    >
      <div className="staff-registration-page">
        <div className="staff-registration-note">
          <strong>Admin account setup</strong>
          <span>
            Use this form for faculty and staff. Students should claim their
            school-registered record from the student portal.
          </span>
        </div>

        <form className="staff-registration-card" onSubmit={handleSubmit}>
          <section className="staff-registration-section">
            <h2 className="staff-section-heading">
              <span><SisIcon name="user" /></span>
              Personal Information
            </h2>

            <div className="staff-form-grid">
              <div className="staff-field">
                <label htmlFor="staff-full-name">
                  Full Name <span>*</span>
                </label>
                <input
                  id="staff-full-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="staff-field">
                <label htmlFor="staff-employee-id">
                  Employee ID <span>*</span>
                </label>
                <input
                  id="staff-employee-id"
                  name="employeeId"
                  type="text"
                  placeholder="e.g. EMP-00125"
                  required
                />
              </div>

              <div className="staff-field">
                <label htmlFor="staff-email">
                  Work Email Address <span>*</span>
                </label>
                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@papsi.edu.ph"
                  required
                />
              </div>

              <div className="staff-field">
                <label htmlFor="staff-phone">Contact Number (Optional)</label>
                <input
                  id="staff-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="09XX-XXX-XXXX"
                  pattern="09[0-9]{2}-?[0-9]{3}-?[0-9]{4}"
                  title="Enter a Philippine mobile number, for example 0912-345-6789."
                />
              </div>
            </div>
          </section>

          <section className="staff-registration-section">
            <h2 className="staff-section-heading">
              <span><SisIcon name="courses" /></span>
              Employment & Access
            </h2>

            <div className="staff-form-grid">
              <div className="staff-field">
                <label htmlFor="staff-type">
                  Employee Type <span>*</span>
                </label>
                <select
                  id="staff-type"
                  name="employeeType"
                  value={personType}
                  onChange={(event) => setPersonType(event.target.value)}
                  required
                >
                  <option value="" disabled>Select employee type</option>
                  <option value="system_admin">Systems Administrator</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div className="staff-field">
                <label htmlFor="staff-department">
                  Department <span>*</span>
                </label>
                <select id="staff-department" name="department" defaultValue="" required>
                  <option value="" disabled>Select department</option>
                  <option value="education">College of Education</option>
                  <option value="business">College of Business</option>
                  <option value="information-technology">Information Technology</option>
                  <option value="arts-sciences">Arts and Sciences</option>
                  <option value="registrar">Registrar&apos;s Office</option>
                  <option value="administration">Administration</option>
                  <option value="library">Library</option>
                </select>
              </div>

              <div className="staff-field">
                <label htmlFor="staff-position">
                  Position / Designation <span>*</span>
                </label>
                <input
                  id="staff-position"
                  name="position"
                  type="text"
                  placeholder={personType === 'faculty' ? 'e.g. Instructor' : 'e.g. Office Assistant'}
                  required
                />
              </div>

              <div className="staff-field">
                <label htmlFor="staff-access-role">
                  System Access Role <span>*</span>
                </label>
                <select id="staff-access-role" name="accessRole" defaultValue="" required>
                  <option value="" disabled>Select access role</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                  <option value="registrar">Registrar</option>
                  <option value="department-coordinator">Department Coordinator</option>
                </select>
                <span className="staff-field-hint">
                  Access roles determine which system features the account can use.
                </span>
              </div>
            </div>
          </section>

          <div className="staff-invitation-info">
            <span className="staff-invitation-icon"><SisIcon name="shield" /></span>
            <p>
              The account holder will set their own password through an
              invitation email. Passwords are not entered or stored here.
            </p>
          </div>

          {notice && <p className="staff-form-notice" role="status">{notice}</p>}

          <div className="staff-form-actions">
            <button
              className="staff-button staff-button-secondary"
              type="button"
              onClick={() => {
                setNotice('')
                window.location.hash = '#users'
              }}
            >
              <SisIcon name="close" />
              Cancel
            </button>
            <button className="staff-button staff-button-primary" type="submit">
              <SisIcon name="users" />
              Create Faculty / Staff Account
            </button>
          </div>
        </form>
      </div>
    </SisLayout>
  )
}

export default FacultyStaffRegistration
