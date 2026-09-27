import { useEffect, useMemo, useState } from 'react'
import { getExamByCode, type ExamRecord } from './ExamStorage'
import { parseExamQuestions, shuffleQuestionIndexes } from './examQuestions'
import './StudentExamSession.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'ready'; exam: ExamRecord; questions: string[]; shuffleCount: number }

function isIOSDevice() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function StudentExamSession({ code }: { code: string }) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [answerValues, setAnswerValues] = useState<Record<number, string>>({})
  const [isIOS] = useState(isIOSDevice)
  const [isFullscreen, setIsFullscreen] = useState(
    () => document.fullscreenElement !== null,
  )
  const [fullscreenError, setFullscreenError] = useState('')
  const [focusError, setFocusError] = useState('')
  const questionFile = loadState.status === 'ready'
    ? loadState.exam.questionsFile
    : null
  const questionsUrl = useMemo(
    () => questionFile ? URL.createObjectURL(questionFile) : '',
    [questionFile],
  )

  useEffect(() => {
    let cancelled = false
    getExamByCode(code.trim().toUpperCase())
      .then(async (exam) => {
        if (!exam) {
          if (!cancelled) setLoadState({ status: 'not-found' })
          return
        }

        const questionText = exam.questionsFile &&
          exam.questionsFileName.toLowerCase().endsWith('.txt')
          ? await exam.questionsFile.text()
          : ''
        const originalQuestions = parseExamQuestions(questionText)
        const focusKey = `sis-exam-focus-${exam.code}`
        const shouldShuffle = sessionStorage.getItem(focusKey) === 'shuffle'
        sessionStorage.removeItem(focusKey)
        sessionStorage.removeItem(`${focusKey}-reloading`)
        const questions = shouldShuffle
          ? shuffleQuestionIndexes(originalQuestions.length)
              .map((index) => originalQuestions[index])
          : originalQuestions
        if (!cancelled) {
          setLoadState({
            status: 'ready',
            exam,
            questions,
            shuffleCount: shouldShuffle ? 1 : 0,
          })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Could not load this exam.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [code])

  useEffect(() => {
    if (questionsUrl) return () => URL.revokeObjectURL(questionsUrl)
  }, [questionsUrl])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (loadState.status !== 'ready') return
    const focusKey = `sis-exam-focus-${loadState.exam.code}`

    function markFocusLoss() {
      try {
        sessionStorage.setItem(focusKey, 'shuffle')
      } catch {
        setFocusError('This browser cannot track focus changes, so the exam will not refresh or shuffle on tab changes.')
      }
    }

    function reloadAfterFocusLoss() {
      try {
        if (
          sessionStorage.getItem(focusKey) === 'shuffle' &&
          sessionStorage.getItem(`${focusKey}-reloading`) !== 'yes'
        ) {
          sessionStorage.setItem(`${focusKey}-reloading`, 'yes')
          window.location.reload()
        }
      } catch {
        setFocusError('This browser cannot track focus changes, so the exam will not refresh or shuffle on tab changes.')
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') markFocusLoss()
      else reloadAfterFocusLoss()
    }

    window.addEventListener('blur', markFocusLoss)
    window.addEventListener('focus', reloadAfterFocusLoss)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('blur', markFocusLoss)
      window.removeEventListener('focus', reloadAfterFocusLoss)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadState])

  async function enterFullscreen() {
    if (!document.documentElement.requestFullscreen) {
      setFullscreenError('Fullscreen is not available in this browser.')
      return
    }
    try {
      await document.documentElement.requestFullscreen()
      setFullscreenError('')
    } catch {
      setFullscreenError('Fullscreen could not be started. Use a supported browser and try again.')
    }
  }

  if (loadState.status === 'loading') {
    return <main className="student-exam-message"><p>Loading exam…</p></main>
  }
  if (loadState.status === 'not-found') {
    return (
      <main className="student-exam-message">
        <h1>Exam not found</h1>
        <p>This code is invalid or the exam is not available on this device.</p>
        <a href="#my%20exams">Return to My Exams</a>
      </main>
    )
  }
  if (loadState.status === 'error') {
    return (
      <main className="student-exam-message">
        <h1>Could not open exam</h1>
        <p role="alert">{loadState.message}</p>
        <a href="#my%20exams">Return to My Exams</a>
      </main>
    )
  }

  const { exam, questions } = loadState
  const shouldRequireFullscreen =
    !isIOS && Boolean(document.documentElement.requestFullscreen) && !isFullscreen
  const isTextQuestions = exam.questionsFileName.toLowerCase().endsWith('.txt')

  return (
    <main className="student-exam-page">
      <header className="student-exam-header">
        <div>
          <span>STUDENT EXAM</span>
          <h1>{exam.title}</h1>
          <p>{exam.subject} · {exam.courseCode} · {exam.yearName} · {exam.sectionName}</p>
        </div>
        <div className="student-exam-code">Code <strong>{exam.code}</strong></div>
      </header>

      {shouldRequireFullscreen && (
        <section className="student-exam-fullscreen" role="status">
          <div>
            <strong>Fullscreen is required to continue.</strong>
            <span>{fullscreenError || 'Enter fullscreen before starting the exam.'}</span>
          </div>
          <button type="button" onClick={enterFullscreen}>Enter fullscreen</button>
        </section>
      )}

      <section className={`student-exam-content${shouldRequireFullscreen ? ' is-locked' : ''}`}>
        {focusError && <p className="student-exam-focus-error" role="alert">{focusError}</p>}
        <div className="student-exam-details">
          <span>{exam.levelName} · {exam.departmentName}</span>
          <span>{exam.examDate ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${exam.examDate}T00:00:00`)) : 'No exam date set'}</span>
          {exam.duration && <span>{exam.duration} minutes</span>}
        </div>

        {exam.questionsFile ? (
          isTextQuestions ? (
            questions.length ? (
              <section className="student-exam-question-list" aria-label="Exam questions">
                <div className="student-exam-question-heading">
                  <h2>Questions</h2>
                  <span>{questions.length} questions</span>
                </div>
                {questions.map((question, index) => (
                  <article className="student-exam-question" key={`${index}-${question.slice(0, 24)}`}>
                    <h3>Question {index + 1}</h3>
                    <p>{question}</p>
                    <label>
                      Your answer
                      <textarea
                        value={answerValues[index] ?? ''}
                        onChange={(event) =>
                          setAnswerValues((answers) => ({
                            ...answers,
                            [index]: event.currentTarget.value,
                          }))
                        }
                        rows={3}
                        disabled={shouldRequireFullscreen}
                      />
                    </label>
                  </article>
                ))}
                {loadState.shuffleCount > 0 && (
                  <p className="student-exam-shuffle-notice" role="status">
                    Questions were shuffled after leaving the exam tab.
                  </p>
                )}
              </section>
            ) : (
              <p className="student-exam-no-questions">
                The teacher’s text file does not contain any readable questions.
              </p>
            )
          ) : (
            <section className="student-exam-document">
              <h2>Exam questions</h2>
              <p>
                This document format can be viewed here, but its questions cannot
                be automatically separated and shuffled. Text (.txt) question
                files are shuffled after focus is lost.
              </p>
              {exam.questionsFileType === 'application/pdf' ? (
                <iframe title="Exam question document" src={questionsUrl} />
              ) : (
                <a href={questionsUrl} download={exam.questionsFileName}>
                  Download {exam.questionsFileName}
                </a>
              )}
            </section>
          )
        ) : (
          <p className="student-exam-no-questions">
            The teacher has not attached a question file for this exam yet.
          </p>
        )}
      </section>
    </main>
  )
}

export default StudentExamSession
