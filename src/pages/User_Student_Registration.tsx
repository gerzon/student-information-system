import { useState, type FormEvent } from 'react'
import { SisIcon } from './SisIcon'
import './User_Student_Registration.css'

type StudentRecord = {
  studentNumber: string
  firstName: string
  middleName: string
  lastName: string
  program: string
  yearLevel: number
  claimed: boolean
}

type LookupState = 'idle' | 'not-found' | 'claimed' | 'available'

const demoStudentRecords: StudentRecord[] = [
  {
    studentNumber: '2024-00123',
    firstName: 'Alex',
    middleName: 'Marie',
    lastName: 'Dela Cruz',
    program: 'BS Information Technology',
    yearLevel: 2,
    claimed: false,
  },
  {
    studentNumber: '2024-00001',
    firstName: 'Jamie',
    middleName: 'Santos',
    lastName: 'Reyes',
    program: 'Bachelor of Elementary Education',
    yearLevel: 3,
    claimed: true,
  },
]

function UserRegistration() {
  const [studentNumber, setStudentNumber] = useState('')
  const [student, setStudent] = useState<StudentRecord | null>(null)
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [registrationStarted, setRegistrationStarted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState('')

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    setRegistrationStarted(false)

    const match = demoStudentRecords.find(
      (record) =>
        record.studentNumber.toLowerCase() === studentNumber.trim().toLowerCase(),
    )

    if (!match) {
      setStudent(null)
      setLookupState('not-found')
      return
    }

    setStudent(match)
    setLookupState(match.claimed ? 'claimed' : 'available')
  }

  function handleStudentNumberChange(value: string) {
    setStudentNumber(value)
    setStudent(null)
    setLookupState('idle')
    setRegistrationStarted(false)
    setNotice('')
  }

  function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setNotice('Passwords do not match. Please check both password fields.')
      return
    }

    setNotice(
      'This is a UI preview. No account was created and this student record was not changed.',
    )
  }

  function resetClaim() {
    setStudentNumber('')
    setStudent(null)
    setLookupState('idle')
    setRegistrationStarted(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
    setPassword('')
    setConfirmPassword('')
    setNotice('')
  }

  const officialName = student
    ? [student.firstName, student.middleName, student.lastName]
        .filter(Boolean)
        .join(' ')
    : ''

  return (
    <div className="student-registration-page">
      <header className="student-portal-header">
        <a className="student-portal-brand" href="#login">
          <span className="student-portal-brand-mark">
            <img src="/papsi_logo%20(2).png" alt="" />
          </span>
          <span>
            <strong>PAPSI College Ormoc</strong>
            <small>Student Information System</small>
          </span>
        </a>
        <a className="student-portal-login" href="#login">
          Already registered? <strong>Log in</strong>
        </a>
      </header>

      <main className="student-registration-main">
        <div className="student-registration-intro">
          <span className="student-registration-eyebrow">STUDENT PORTAL</span>
          <h1>Student Account Registration</h1>
          <p>Claim your school-registered student record to create an account.</p>
        </div>

        <div className="claim-page">
        <div className="claim-preview-note">
          <strong>UI preview:</strong> student-number lookup uses sample records in
          this browser only. Nothing is saved or verified by the school.
        </div>

        <section className="claim-card" aria-labelledby="claim-lookup-title">
          <div className="claim-step-heading">
            <span className="claim-step-number">1</span>
            <div>
              <h2 id="claim-lookup-title">Find your student record</h2>
              <p>Enter the student number provided to you by the school.</p>
            </div>
          </div>

          <form className="claim-lookup-form" onSubmit={handleLookup}>
            <div className="claim-field">
              <label htmlFor="claim-student-number">
                Student Number <span aria-hidden="true">*</span>
              </label>
              <input
                id="claim-student-number"
                name="studentNumber"
                type="text"
                autoComplete="off"
                placeholder="e.g. 2024-00123"
                value={studentNumber}
                onChange={(event) => handleStudentNumberChange(event.target.value)}
                required
              />
              <span className="claim-field-hint">
                Demo available: 2024-00123 (unclaimed), 2024-00001 (claimed)
              </span>
            </div>
            <button className="claim-button claim-button-primary" type="submit">
              <SisIcon name="students" />
              Find my record
            </button>
          </form>

          {lookupState === 'not-found' && (
            <p className="claim-message is-error" role="alert">
              Student number not found. Please contact the school administrator.
            </p>
          )}

          {lookupState === 'claimed' && (
            <p className="claim-message is-error" role="alert">
              This student account has already been registered. Please log in
              instead. <a href="#login">Go to login</a>
            </p>
          )}

          {lookupState === 'available' && student && (
            <div className="claim-record-result" aria-live="polite">
              <div className="claim-result-heading">
                <span className="claim-result-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </span>
                <div>
                  <strong>Student record found</strong>
                  <span>Please confirm these details belong to you.</span>
                </div>
              </div>

              <dl className="claim-record-details">
                <div>
                  <dt>Official name</dt>
                  <dd>{officialName}</dd>
                </div>
                <div>
                  <dt>Student number</dt>
                  <dd>{student.studentNumber}</dd>
                </div>
                <div>
                  <dt>Program</dt>
                  <dd>{student.program}</dd>
                </div>
                <div>
                  <dt>Year level</dt>
                  <dd>Year {student.yearLevel}</dd>
                </div>
              </dl>

              {!registrationStarted ? (
                <div className="claim-result-actions">
                  <button
                    className="claim-button claim-button-primary"
                    type="button"
                    onClick={() => setRegistrationStarted(true)}
                  >
                    Yes, continue
                  </button>
                  <button
                    className="claim-button claim-button-secondary"
                    type="button"
                    onClick={resetClaim}
                  >
                    That&apos;s not me
                  </button>
                </div>
              ) : (
                <form
                  className="claim-account-form"
                  onSubmit={handleRegistration}
                >
                  <div className="claim-step-heading claim-account-heading">
                    <span className="claim-step-number">2</span>
                    <div>
                      <h2>Create your sign-in details</h2>
                      <p>Your school name and student number cannot be edited.</p>
                    </div>
                  </div>

                  <div className="claim-locked-record">
                    <span>
                      <small>Official name</small>
                      <strong>{officialName}</strong>
                    </span>
                    <span>
                      <small>Student number</small>
                      <strong>{student.studentNumber}</strong>
                    </span>
                    <span className="claim-locked-icon" title="School record, read only">
                      <SisIcon name="shield" />
                    </span>
                  </div>

                  <div className="claim-account-fields">
                    <div className="claim-field">
                      <label htmlFor="claim-email">
                        Email Address <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="claim-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="claim-field">
                      <label htmlFor="claim-phone">Phone Number (Optional)</label>
                      <input
                        id="claim-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="09XX-XXX-XXXX"
                        pattern="09[0-9]{2}-?[0-9]{3}-?[0-9]{4}"
                        title="Enter a Philippine mobile number, for example 0912-345-6789."
                      />
                    </div>

                    <div className="claim-field">
                      <label htmlFor="claim-password">
                        Create Password <span aria-hidden="true">*</span>
                      </label>
                      <div className="claim-password-wrap">
                        <input
                          id="claim-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          minLength={8}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="claim-password-toggle"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((show) => !show)}
                        >
                          <SisIcon name={showPassword ? 'eyeOff' : 'eye'} />
                        </button>
                      </div>
                    </div>

                    <div className="claim-field">
                      <label htmlFor="claim-confirm-password">
                        Confirm Password <span aria-hidden="true">*</span>
                      </label>
                      <div className="claim-password-wrap">
                        <input
                          id="claim-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          aria-invalid={passwordMismatch}
                          aria-describedby={
                            passwordMismatch
                              ? 'claim-password-error'
                              : undefined
                          }
                          required
                        />
                        <button
                          type="button"
                          className="claim-password-toggle"
                          aria-label={
                            showConfirmPassword
                              ? 'Hide confirmation password'
                              : 'Show confirmation password'
                          }
                          onClick={() =>
                            setShowConfirmPassword((show) => !show)
                          }
                        >
                          <SisIcon
                            name={showConfirmPassword ? 'eyeOff' : 'eye'}
                          />
                        </button>
                      </div>
                      {passwordMismatch && (
                        <span
                          className="claim-field-error"
                          id="claim-password-error"
                        >
                          Passwords do not match.
                        </span>
                      )}
                    </div>
                  </div>

                  {notice && (
                    <p
                      className={`claim-message${notice.startsWith('Passwords') ? ' is-error' : ''}`}
                      role={
                        notice.startsWith('Passwords') ? 'alert' : 'status'
                      }
                    >
                      {notice}
                    </p>
                  )}

                  <div className="claim-result-actions">
                    <button
                      className="claim-button claim-button-primary"
                      type="submit"
                    >
                      Create Student Account
                    </button>
                    <button
                      className="claim-button claim-button-secondary"
                      type="button"
                      onClick={() => {
                        setRegistrationStarted(false)
                        setPassword('')
                        setConfirmPassword('')
                        setNotice('')
                      }}
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        </div>
      </main>

      <footer className="student-portal-footer">
        PAPSI College Ormoc · Student Information System
      </footer>
    </div>
  )
}

export default UserRegistration
