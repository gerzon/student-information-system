import { useMemo, useState } from 'react'
import {
  loadSubjectsForClass,
  type ManagedSubject,
} from './AcademicSubjects'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './MyAttendancePage.css'

type AttendanceStatus = 'Present' | 'Late' | 'Absent'

type AttendanceRecord = {
  subjectId: string
  date: string
  status: AttendanceStatus
}

const studentClass = {
  levelId: 'tertiary',
  courseId: 'bsit',
  yearName: 'Year 2',
  sectionName: 'BSIT 2A',
}

const sampleDates = ['2025-09-08', '2025-09-15', '2025-09-22', '2025-09-29']
const sampleStatusPatterns: AttendanceStatus[][] = [
  ['Present', 'Present', 'Late', 'Present'],
  ['Present', 'Absent', 'Present', 'Present'],
  ['Present', 'Present', 'Present', 'Absent'],
  ['Late', 'Present', 'Present', 'Present'],
]

function createSampleRecords(subjects: ManagedSubject[]): AttendanceRecord[] {
  return subjects.flatMap((subject, subjectIndex) =>
    sampleDates.map((date, dateIndex) => ({
      subjectId: subject.id,
      date,
      status: sampleStatusPatterns[subjectIndex % sampleStatusPatterns.length][dateIndex],
    })),
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function MyAttendancePage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('all')
  const attendanceState = useMemo(() => {
    try {
      const subjects = loadSubjectsForClass(studentClass).subjects
      return { subjects, records: createSampleRecords(subjects), error: '' }
    } catch (error: unknown) {
      return {
        subjects: [] as ManagedSubject[],
        records: [] as AttendanceRecord[],
        error: error instanceof Error ? error.message : 'Could not load your subject load.',
      }
    }
  }, [])

  const { subjects, records } = attendanceState
  const presentCount = records.filter((record) => record.status === 'Present').length
  const lateCount = records.filter((record) => record.status === 'Late').length
  const absentCount = records.filter((record) => record.status === 'Absent').length
  const attendanceRate = records.length
    ? Math.round(((presentCount + lateCount) / records.length) * 100)
    : 0
  const visibleRecords = records
    .filter((record) => selectedSubjectId === 'all' || record.subjectId === selectedSubjectId)
    .sort((first, second) => second.date.localeCompare(first.date))

  return (
    <SisLayout
      active="My Attendance"
      breadcrumb="My Attendance"
      breadcrumbRoot="My Attendance"
      breadcrumbHref="#my%20attendance"
      title="My Attendance"
      subtitle="Review your attendance record for each subject in your current load."
      icon="qrcodeattendance"
    >
      <div className="my-attendance-page">
        <div className="my-attendance-notice" role="note">
          <strong>Sample data:</strong> these attendance records are a UI preview
          and are not connected to QR check-ins.
        </div>

        <section className="my-attendance-student-card" aria-label="Student and class information">
          <div className="my-attendance-avatar" aria-hidden="true">JD</div>
          <div>
            <strong>Juan Dela Cruz</strong>
            <span>2024-2A001 · Bachelor of Science in Information Technology</span>
          </div>
          <span className="my-attendance-term">Academic Year 2025–2026 · First Semester</span>
        </section>

        {attendanceState.error ? (
          <p className="my-attendance-error" role="alert">{attendanceState.error}</p>
        ) : (
          <>
            <section className="my-attendance-summary" aria-label="Attendance summary">
              <div className="my-attendance-summary-item">
                <span className="my-attendance-summary-icon"><SisIcon name="calendar" /></span>
                <span><strong>{records.length}</strong><small>Sessions recorded</small></span>
              </div>
              <div className="my-attendance-summary-item">
                <span className="my-attendance-summary-icon is-green"><SisIcon name="qrcodeattendance" /></span>
                <span><strong>{presentCount + lateCount}</strong><small>Attended (including late)</small></span>
              </div>
              <div className="my-attendance-summary-item">
                <span className="my-attendance-summary-icon is-orange"><SisIcon name="qrcodeattendance" /></span>
                <span><strong>{absentCount}</strong><small>Absences</small></span>
              </div>
              <div className="my-attendance-summary-item">
                <span className="my-attendance-summary-icon is-violet"><SisIcon name="grades" /></span>
                <span><strong>{records.length ? `${attendanceRate}%` : '—'}</strong><small>Attendance rate</small></span>
              </div>
            </section>

            <section className="my-attendance-panel" aria-labelledby="my-attendance-subjects-title">
              <div className="my-attendance-panel-heading">
                <div>
                  <h2 id="my-attendance-subjects-title">Attendance by subject</h2>
                  <p>{studentClass.sectionName} · Based on your enrolled subject load</p>
                </div>
                <span className="my-attendance-subject-count">{subjects.length} subjects loaded</span>
              </div>
              {subjects.length === 0 ? (
                <p className="my-attendance-empty">No subjects are currently included in your load.</p>
              ) : (
                <div className="my-attendance-table-wrap">
                  <table className="my-attendance-table">
                    <thead>
                      <tr>
                        <th scope="col">Subject</th>
                        <th scope="col">Present</th>
                        <th scope="col">Late</th>
                        <th scope="col">Absent</th>
                        <th scope="col">Attendance rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => {
                        const subjectRecords = records.filter((record) => record.subjectId === subject.id)
                        const subjectPresent = subjectRecords.filter((record) => record.status === 'Present').length
                        const subjectLate = subjectRecords.filter((record) => record.status === 'Late').length
                        const subjectAbsent = subjectRecords.filter((record) => record.status === 'Absent').length
                        const rate = subjectRecords.length
                          ? Math.round(((subjectPresent + subjectLate) / subjectRecords.length) * 100)
                          : 0

                        return (
                          <tr key={subject.id}>
                            <td><strong>{subject.name}</strong><span>{subject.code} · {subject.units} units</span></td>
                            <td>{subjectPresent}</td>
                            <td>{subjectLate}</td>
                            <td>{subjectAbsent}</td>
                            <td>
                              <span className={`my-attendance-rate${rate < 75 ? ' is-low' : ''}`}>
                                {subjectRecords.length ? `${rate}%` : '—'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="my-attendance-panel" aria-labelledby="my-attendance-records-title">
              <div className="my-attendance-panel-heading">
                <div>
                  <h2 id="my-attendance-records-title">Session history</h2>
                  <p>Attendance records for the subjects in your current load.</p>
                </div>
                <label className="my-attendance-filter">
                  <span>Subject</span>
                  <select
                    value={selectedSubjectId}
                    onChange={(event) => setSelectedSubjectId(event.currentTarget.value)}
                    aria-label="Filter attendance by subject"
                  >
                    <option value="all">All subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.code} · {subject.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              {visibleRecords.length === 0 ? (
                <p className="my-attendance-empty">There are no attendance sessions to show.</p>
              ) : (
                <div className="my-attendance-table-wrap">
                  <table className="my-attendance-table my-attendance-history">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRecords.map((record) => {
                        const subject = subjects.find((item) => item.id === record.subjectId)
                        if (!subject) return null
                        return (
                          <tr key={`${record.subjectId}-${record.date}`}>
                            <td>{formatDate(record.date)}</td>
                            <td><strong>{subject.name}</strong><span>{subject.code}</span></td>
                            <td><span className={`my-attendance-status is-${record.status.toLowerCase()}`}>{record.status}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </SisLayout>
  )
}

export default MyAttendancePage
