import { useState, type FormEvent } from 'react'
import SisLayout from './SisLayout'
import './MyExamsPage.css'

function MyExamsPage() {
  const [examCode, setExamCode] = useState('')
  const [error, setError] = useState('')

  function openExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = examCode.trim().toUpperCase()
    if (!code) {
      setError('Enter the examination code given by your teacher.')
      return
    }

    const examWindow = window.open('about:blank', '_blank')
    if (!examWindow) {
      setError('The exam tab was blocked. Allow pop-ups for this site and try again.')
      return
    }

    examWindow.opener = null
    examWindow.location.href =
      `${window.location.origin}${window.location.pathname}${window.location.search}#exam-session/${encodeURIComponent(code)}`
    setError('')
  }

  return (
    <SisLayout
      role="student"
      active="My Exams"
      breadcrumb="My Exams"
      breadcrumbRoot="My Exams"
      breadcrumbHref="#my%20exams"
      title="My Exams"
      subtitle="Enter the examination code provided by your teacher to open your exam in a new tab."
      icon="student_own_exam"
    >
      <div className="my-exams-page">
        <section className="my-exams-card" aria-labelledby="my-exams-title">
          <span className="my-exams-icon" aria-hidden="true">EX</span>
          <h2 id="my-exams-title">Open an examination</h2>
          <p>Ask your teacher for the code, then enter it below.</p>
          <form className="my-exams-form" onSubmit={openExam}>
            <label htmlFor="examination-code">Examination code</label>
            <input
              id="examination-code"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={12}
              placeholder="e.g. 8K4M2P"
              value={examCode}
              onChange={(event) => {
                setExamCode(event.currentTarget.value.toUpperCase())
                setError('')
              }}
              required
            />
            {error && <p className="my-exams-error" role="alert">{error}</p>}
            <button type="submit">Open exam in new tab</button>
          </form>
          <p className="my-exams-note">
            Keep the exam tab open and in focus while answering. Leaving it may
            refresh the page and shuffle text-based questions.
          </p>
        </section>
      </div>
    </SisLayout>
  )
}

export default MyExamsPage
