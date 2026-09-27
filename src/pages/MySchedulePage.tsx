import { useMemo } from 'react'
import SisLayout from './SisLayout'
import { SisIcon } from './SisIcon'
import './MySchedulePage.css'

type ScheduleEntry = {
  subject: string
  code: string
  instructor: string
  room: string
  day: string
  start: string
  end: string
  color: 'blue' | 'violet' | 'green' | 'orange'
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const timeSlots = ['7:30 AM', '9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM']

const studentSchedule: ScheduleEntry[] = [
  { subject: 'Web Development', code: 'IT 204', instructor: 'J. Ramos', room: 'Lab 1', day: 'Monday', start: '7:30 AM', end: '9:00 AM', color: 'blue' },
  { subject: 'Database Systems', code: 'IT 206', instructor: 'M. Santos', room: 'Room 204', day: 'Monday', start: '10:30 AM', end: '12:00 PM', color: 'violet' },
  { subject: 'Purposive Communication', code: 'GE 4', instructor: 'A. Dela Cruz', room: 'Room 105', day: 'Tuesday', start: '9:00 AM', end: '10:30 AM', color: 'green' },
  { subject: 'Object-Oriented Programming', code: 'IT 205', instructor: 'R. Villanueva', room: 'Lab 2', day: 'Tuesday', start: '1:00 PM', end: '2:30 PM', color: 'orange' },
  { subject: 'Web Development', code: 'IT 204', instructor: 'J. Ramos', room: 'Lab 1', day: 'Wednesday', start: '7:30 AM', end: '9:00 AM', color: 'blue' },
  { subject: 'Database Systems', code: 'IT 206', instructor: 'M. Santos', room: 'Room 204', day: 'Thursday', start: '10:30 AM', end: '12:00 PM', color: 'violet' },
  { subject: 'Physical Education 4', code: 'PE 4', instructor: 'C. Garcia', room: 'Gymnasium', day: 'Friday', start: '1:00 PM', end: '2:30 PM', color: 'green' },
]

function MySchedulePage() {
  const entriesBySlot = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>()

    studentSchedule.forEach((entry) => {
      const key = `${entry.day}:${entry.start}`
      const current = map.get(key) ?? []
      current.push(entry)
      map.set(key, current)
    })

    return map
  }, [])

  return (
    <SisLayout
      active="My Schedule"
      breadcrumb="My Schedule"
      breadcrumbRoot="My Schedule"
      breadcrumbHref="#my%20schedule"
      title="My Schedule"
      subtitle="Review your weekly classes, room assignments, and faculty schedule."
      icon="calendar"
    >
      <div className="my-schedule-page">
        <section className="my-schedule-summary" aria-label="Student schedule summary">
          <div className="my-schedule-summary-item">
            <span className="my-schedule-summary-icon">
              <SisIcon name="calendar" />
            </span>
            <span>
              <strong>{studentSchedule.length}</strong>
              <small>Classes this week</small>
            </span>
          </div>
          <div className="my-schedule-summary-item">
            <span className="my-schedule-summary-icon is-violet">
              <SisIcon name="sections" />
            </span>
            <span>
              <strong>BSIT 2-A</strong>
              <small>Current section</small>
            </span>
          </div>
          <div className="my-schedule-summary-item">
            <span className="my-schedule-summary-icon is-green">
              <SisIcon name="users" />
            </span>
            <span>
              <strong>{new Set(studentSchedule.map((entry) => entry.instructor)).size}</strong>
              <small>Faculty members</small>
            </span>
          </div>
        </section>

        <section className="my-schedule-panel" aria-labelledby="my-schedule-board-title">
          <div className="my-schedule-panel-heading">
            <div>
              <h2 id="my-schedule-board-title">Weekly timetable</h2>
              <p>Academic Year 2025–2026 · First Semester</p>
            </div>
            <span className="my-schedule-badge">
              <SisIcon name="calendar" />
              Student view
            </span>
          </div>

          <div className="my-schedule-board" role="grid" aria-label="Student weekly schedule">
            <div className="my-schedule-time-column" aria-hidden="true">
              <div className="my-schedule-corner">Time</div>
              {timeSlots.map((time) => (
                <div className="my-schedule-time" key={time}>{time}</div>
              ))}
            </div>

            {days.map((day) => (
              <div className="my-schedule-day-column" key={day}>
                <div className="my-schedule-day-heading">{day}</div>
                {timeSlots.map((time) => {
                  const slotEntries = entriesBySlot.get(`${day}:${time}`) ?? []

                  return (
                    <div className="my-schedule-slot" key={`${day}-${time}`}>
                      {slotEntries.map((entry) => (
                        <article className={`my-schedule-card is-${entry.color}`} key={`${entry.day}-${entry.start}-${entry.subject}`}>
                          <strong>{entry.subject}</strong>
                          <span>{entry.code}</span>
                          <small>{entry.instructor}</small>
                          <small>{entry.room}</small>
                          <em>{entry.start} – {entry.end}</em>
                        </article>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </SisLayout>
  )
}

export default MySchedulePage
