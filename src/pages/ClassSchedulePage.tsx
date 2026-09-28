import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { readSheet } from 'read-excel-file/browser'
import SisLayout from './SisLayout'
import type { SisPortalRole } from './SisLayout'
import { SisIcon } from './SisIcon'
import './ClassSchedulePage.css'

type ScheduleEntry = {
  id: number
  subject: string
  code: string
  section: string
  instructor: string
  room: string
  day: string
  start: string
  end: string
  color: string
}

type ImportPreview = {
  fileName: string
  entries: Omit<ScheduleEntry, 'id' | 'color'>[]
  errors: string[]
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const timeSlots = ['7:30 AM', '9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM']
const scheduleColors = ['blue', 'violet', 'green', 'orange']
const importColumns = ['Subject', 'Code', 'Section', 'Instructor', 'Room', 'Day', 'Start Time', 'End Time']

function cellText(value: unknown): string {
  if (value instanceof Date) return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return value == null ? '' : String(value).trim()
}

function normalizedTime(value: unknown): string {
  if (value instanceof Date) {
    const hours = value.getHours()
    const minutes = value.getMinutes()
    return formatTime(hours, minutes)
  }
  if (typeof value === 'number' && value >= 0 && value < 1) {
    const minutesFromMidnight = Math.round(value * 24 * 60)
    return formatTime(Math.floor(minutesFromMidnight / 60), minutesFromMidnight % 60)
  }
  const text = cellText(value).toUpperCase().replace(/\s+/g, ' ')
  const twelveHour = text.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/)
  if (twelveHour) return `${Number(twelveHour[1])}:${twelveHour[2]} ${twelveHour[3]}`
  const twentyFourHour = text.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
  if (!twentyFourHour) return text
  return formatTime(Number(twentyFourHour[1]), Number(twentyFourHour[2]))
}

function formatTime(hours: number, minutes: number): string {
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const twelveHour = hours % 12 || 12
  return `${twelveHour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

async function previewScheduleWorkbook(file: File): Promise<ImportPreview> {
  const rows = await readSheet(file, { trim: true })
  if (rows.length < 2) {
    return { fileName: file.name, entries: [], errors: ['The first worksheet must contain a header row and at least one class.'] }
  }

  const headers = rows[0].map((value) => cellText(value).toLowerCase())
  const columnIndexes = importColumns.map((column) => headers.indexOf(column.toLowerCase()))
  const missingColumns = importColumns.filter((_, index) => columnIndexes[index] === -1)
  if (missingColumns.length) {
    return {
      fileName: file.name,
      entries: [],
      errors: [`Missing required columns: ${missingColumns.join(', ')}.`],
    }
  }

  const entries: ImportPreview['entries'] = []
  const errors: string[] = []
  rows.slice(1).forEach((row, rowIndex) => {
    if (row.every((value) => cellText(value) === '')) return
    const rowNumber = rowIndex + 2
    const value = (column: string) => row[columnIndexes[importColumns.indexOf(column)]]
    const subject = cellText(value('Subject'))
    const code = cellText(value('Code'))
    const section = cellText(value('Section'))
    const instructor = cellText(value('Instructor'))
    const room = cellText(value('Room'))
    const rawDay = cellText(value('Day'))
    const day = days.find((item) => item.toLowerCase() === rawDay.toLowerCase())
    const start = normalizedTime(value('Start Time'))
    const end = normalizedTime(value('End Time'))
    const missingFields = [
      ['Subject', subject],
      ['Code', code],
      ['Section', section],
      ['Instructor', instructor],
      ['Room', room],
      ['Day', rawDay],
      ['Start Time', start],
      ['End Time', end],
    ].filter(([, fieldValue]) => !fieldValue).map(([field]) => field)

    if (missingFields.length) {
      errors.push(`Row ${rowNumber}: missing ${missingFields.join(', ')}.`)
      return
    }
    if (!day) {
      errors.push(`Row ${rowNumber}: Day must be one of ${days.join(', ')}.`)
      return
    }
    if (!timeSlots.includes(start)) {
      errors.push(`Row ${rowNumber}: Start Time must be one of ${timeSlots.join(', ')}.`)
      return
    }

    entries.push({ subject, code, section, instructor, room, day, start, end })
  })

  if (!entries.length && errors.length === 0) errors.push('No class rows were found in the first worksheet.')
  return { fileName: file.name, entries, errors }
}

const initialSchedule: ScheduleEntry[] = [
  { id: 1, subject: 'Web Development', code: 'IT 204', section: 'BSIT 2-A', instructor: 'J. Ramos', room: 'Lab 1', day: 'Monday', start: '7:30 AM', end: '9:00 AM', color: 'blue' },
  { id: 2, subject: 'Database Systems', code: 'IT 206', section: 'BSIT 2-A', instructor: 'M. Santos', room: 'Room 204', day: 'Monday', start: '10:30 AM', end: '12:00 PM', color: 'violet' },
  { id: 3, subject: 'Purposive Communication', code: 'GE 4', section: 'BSIT 2-A', instructor: 'A. Dela Cruz', room: 'Room 105', day: 'Tuesday', start: '9:00 AM', end: '10:30 AM', color: 'green' },
  { id: 4, subject: 'Object-Oriented Programming', code: 'IT 205', section: 'BSIT 2-B', instructor: 'R. Villanueva', room: 'Lab 2', day: 'Tuesday', start: '1:00 PM', end: '2:30 PM', color: 'orange' },
  { id: 5, subject: 'Web Development', code: 'IT 204', section: 'BSIT 2-A', instructor: 'J. Ramos', room: 'Lab 1', day: 'Wednesday', start: '7:30 AM', end: '9:00 AM', color: 'blue' },
  { id: 6, subject: 'Database Systems', code: 'IT 206', section: 'BSIT 2-A', instructor: 'M. Santos', room: 'Room 204', day: 'Thursday', start: '10:30 AM', end: '12:00 PM', color: 'violet' },
  { id: 7, subject: 'Physical Education 4', code: 'PE 4', section: 'BSIT 2-B', instructor: 'C. Garcia', room: 'Gymnasium', day: 'Friday', start: '1:00 PM', end: '2:30 PM', color: 'green' },
]

function ClassSchedulePage({
  role = 'admin',
  activeLabel = 'Scheduling',
}: {
  role?: SisPortalRole
  activeLabel?: string
}) {
  const [schedule, setSchedule] = useState(initialSchedule)
  const [selectedSection, setSelectedSection] = useState('All sections')
  const [selectedDay, setSelectedDay] = useState('All days')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [draggedEntryId, setDraggedEntryId] = useState<number | null>(null)
  const [activeDropTarget, setActiveDropTarget] = useState('')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const importFileRef = useRef<HTMLInputElement>(null)

  const sections = useMemo(
    () => ['All sections', ...Array.from(new Set(schedule.map((entry) => entry.section)))],
    [schedule],
  )
  const filteredSchedule = useMemo(() => {
    const query = search.trim().toLowerCase()
    return schedule.filter((entry) =>
      (selectedSection === 'All sections' || entry.section === selectedSection) &&
      (selectedDay === 'All days' || entry.day === selectedDay) &&
      (!query || `${entry.subject} ${entry.code} ${entry.instructor} ${entry.room}`.toLowerCase().includes(query)),
    )
  }, [schedule, selectedDay, selectedSection, search])

  function addScheduleEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const entry: ScheduleEntry = {
      id: Date.now(),
      subject: String(form.get('subject')),
      code: String(form.get('code')),
      section: String(form.get('section')),
      instructor: String(form.get('instructor')),
      room: String(form.get('room')),
      day: String(form.get('day')),
      start: String(form.get('start')),
      end: String(form.get('end')),
      color: 'blue',
    }
    setSchedule((current) => [...current, entry])
    setFormOpen(false)
    setNotice(`${entry.subject} was added to the weekly schedule.`)
    event.currentTarget.reset()
  }

  async function handleScheduleFile(file: File | undefined) {
    setImportPreview(null)
    setImportError('')
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setImportError('Choose an Excel workbook with the .xlsx file extension.')
      if (importFileRef.current) importFileRef.current.value = ''
      return
    }

    setImporting(true)
    try {
      setImportPreview(await previewScheduleWorkbook(file))
    } catch (error: unknown) {
      setImportError(error instanceof Error ? `Could not read this workbook: ${error.message}` : 'Could not read this workbook.')
    } finally {
      setImporting(false)
    }
  }

  function importSchedule() {
    if (!importPreview || importPreview.errors.length > 0) return
    const firstId = Math.max(0, ...schedule.map((entry) => entry.id)) + 1
    const entries = importPreview.entries.map((entry, index) => ({
      ...entry,
      id: firstId + index,
      color: scheduleColors[(firstId + index - 1) % scheduleColors.length],
    }))
    setSchedule((current) => [...current, ...entries])
    setNotice(`${entries.length} class${entries.length === 1 ? '' : 'es'} imported from ${importPreview.fileName}.`)
    setImportDialogOpen(false)
    setImportPreview(null)
    if (importFileRef.current) importFileRef.current.value = ''
  }

  function closeImportDialog() {
    setImportDialogOpen(false)
    setImportPreview(null)
    setImportError('')
    if (importFileRef.current) importFileRef.current.value = ''
  }

  function moveEntry(entryId: number, day: string, start: string) {
    const entry = schedule.find((item) => item.id === entryId)
    if (!entry) return

    if (entry.day !== day || entry.start !== start) {
      setSchedule((current) =>
        current.map((item) =>
          item.id === entryId ? { ...item, day, start } : item,
        ),
      )
      setNotice(`${entry.subject} moved to ${day} at ${start}.`)
    }
    setDraggedEntryId(null)
    setActiveDropTarget('')
  }

  function handleCardKeyDown(
    event: KeyboardEvent<HTMLElement>,
    entry: ScheduleEntry,
  ) {
    const dayOffset = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
    const timeOffset = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (dayOffset === 0 && timeOffset === 0) return

    event.preventDefault()
    const dayIndex = days.indexOf(entry.day)
    const timeIndex = timeSlots.indexOf(entry.start)
    const nextDay = days[dayIndex + dayOffset]
    const nextTime = timeSlots[timeIndex + timeOffset]
    if (nextDay && nextTime) moveEntry(entry.id, nextDay, nextTime)
  }

  return (
    <SisLayout
      role={role}
      active={activeLabel}
      breadcrumb="Class Schedule"
      title="Class Schedule"
      subtitle="Plan and review weekly class assignments for every section."
      icon="calendar"
    >
      <div className="class-schedule-page">
        <section className="schedule-summary" aria-label="Schedule summary">
          <div className="schedule-summary-item">
            <span className="schedule-summary-icon"><SisIcon name="calendar" /></span>
            <span><strong>{schedule.length}</strong><small>Scheduled classes</small></span>
          </div>
          <div className="schedule-summary-item">
            <span className="schedule-summary-icon is-violet"><SisIcon name="sections" /></span>
            <span><strong>{sections.length - 1}</strong><small>Active sections</small></span>
          </div>
          <div className="schedule-summary-item">
            <span className="schedule-summary-icon is-green"><SisIcon name="users" /></span>
            <span><strong>{new Set(schedule.map((entry) => entry.instructor)).size}</strong><small>Faculty assigned</small></span>
          </div>
        </section>

        <section className="schedule-panel" aria-labelledby="schedule-board-title">
          <div className="schedule-panel-heading">
            <div>
              <h2 id="schedule-board-title">Weekly schedule</h2>
              <p>Academic Year 2025–2026 · First Semester</p>
            </div>
            <div className="schedule-heading-actions">
              <button type="button" className="schedule-import-button" onClick={() => setImportDialogOpen(true)}>
                Import XLSX
              </button>
              <button type="button" className="schedule-add-button" onClick={() => setFormOpen(true)}>
                <span aria-hidden="true">+</span> Add class
              </button>
            </div>
          </div>
          {notice && <p className="schedule-notice" role="status">{notice}</p>}
          <div className="schedule-filters">
            <label>
              <span>Section</span>
              <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)}>
                {sections.map((section) => <option key={section}>{section}</option>)}
              </select>
            </label>
            <label>
              <span>Day</span>
              <select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)}>
                <option>All days</option>
                {days.map((day) => <option key={day}>{day}</option>)}
              </select>
            </label>
            <label className="schedule-search">
              <span>Search</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Subject, instructor, room" />
            </label>
          </div>
          <div className="schedule-table-wrap">
            <div className="schedule-table">
              <div className="schedule-time-column">
                <div className="schedule-corner">Time</div>
                {timeSlots.map((time) => <div className="schedule-time" key={time}>{time}</div>)}
              </div>
              {days.map((day) => (
                <div className="schedule-day-column" key={day}>
                  <div className="schedule-day-heading">{day}</div>
                  {timeSlots.map((time) => {
                    const entries = filteredSchedule.filter((entry) => entry.day === day && entry.start === time)
                    return (
                      <div
                        className={`schedule-slot${activeDropTarget === `${day}:${time}` ? ' is-drop-target' : ''}`}
                        key={time}
                        onDragOver={(event) => {
                          event.preventDefault()
                          event.dataTransfer.dropEffect = 'move'
                          setActiveDropTarget(`${day}:${time}`)
                        }}
                        onDragLeave={(event) => {
                          if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return
                          setActiveDropTarget('')
                        }}
                        onDrop={(event) => {
                          event.preventDefault()
                          const entryId = Number(event.dataTransfer.getData('text/plain'))
                          if (Number.isInteger(entryId) && schedule.some((entry) => entry.id === entryId)) {
                            moveEntry(entryId, day, time)
                          } else {
                            setDraggedEntryId(null)
                            setActiveDropTarget('')
                          }
                        }}
                      >
                        {entries.map((entry) => (
                          <article
                            className={`schedule-card is-${entry.color}${draggedEntryId === entry.id ? ' is-dragging' : ''}`}
                            key={entry.id}
                            draggable
                            tabIndex={0}
                            aria-label={`${entry.subject}, ${entry.day} at ${entry.start}. Use arrow keys to reschedule.`}
                            onKeyDown={(event) => handleCardKeyDown(event, entry)}
                            onDragStart={(event) => {
                              event.dataTransfer.setData('text/plain', String(entry.id))
                              event.dataTransfer.effectAllowed = 'move'
                              setDraggedEntryId(entry.id)
                            }}
                            onDragEnd={() => {
                              setDraggedEntryId(null)
                              setActiveDropTarget('')
                            }}
                          >
                            <strong>{entry.subject}</strong>
                            <span>{entry.code} · {entry.section}</span>
                            <small>{entry.instructor} · {entry.room}</small>
                          </article>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            {filteredSchedule.length === 0 && <p className="schedule-empty">No classes match the current filters.</p>}
          </div>
        </section>

        {formOpen && (
          <div className="schedule-modal-backdrop" role="presentation">
            <section className="schedule-modal" role="dialog" aria-modal="true" aria-labelledby="add-class-title">
              <div className="schedule-modal-heading">
                <div><h2 id="add-class-title">Add class to schedule</h2><p>Enter the class details for this week.</p></div>
                <button type="button" aria-label="Close add class dialog" onClick={() => setFormOpen(false)}>×</button>
              </div>
              <form className="schedule-form" onSubmit={addScheduleEntry}>
                <label>Subject<input name="subject" required placeholder="e.g. Software Engineering" /></label>
                <div className="schedule-form-grid">
                  <label>Subject code<input name="code" required placeholder="e.g. IT 301" /></label>
                  <label>Section<select name="section" defaultValue={sections[1] ?? ''}>{sections.slice(1).map((section) => <option key={section}>{section}</option>)}</select></label>
                </div>
                <div className="schedule-form-grid">
                  <label>Day<select name="day">{days.map((day) => <option key={day}>{day}</option>)}</select></label>
                  <label>Start time<select name="start">{timeSlots.map((time) => <option key={time}>{time}</option>)}</select></label>
                </div>
                <div className="schedule-form-grid">
                  <label>End time<input name="end" required placeholder="e.g. 9:00 AM" /></label>
                  <label>Room<input name="room" required placeholder="e.g. Room 301" /></label>
                </div>
                <label>Instructor<input name="instructor" required placeholder="e.g. A. Santos" /></label>
                <div className="schedule-modal-actions">
                  <button type="button" className="schedule-cancel-button" onClick={() => setFormOpen(false)}>Cancel</button>
                  <button type="submit" className="schedule-add-button">Save class</button>
                </div>
              </form>
            </section>
          </div>
        )}
        {importDialogOpen && (
          <div className="schedule-modal-backdrop" role="presentation">
            <section className="schedule-modal" role="dialog" aria-modal="true" aria-labelledby="import-schedule-title">
              <div className="schedule-modal-heading">
                <div>
                  <h2 id="import-schedule-title">Import class schedule</h2>
                  <p>Select an Excel workbook to append classes to the current schedule.</p>
                </div>
                <button type="button" aria-label="Close import dialog" onClick={closeImportDialog}>×</button>
              </div>
              <p className="schedule-import-help">
                Use the first worksheet with these column headers: <strong>{importColumns.join(', ')}</strong>.
                Day must be Monday–Friday and Start Time must match a visible schedule slot.
              </p>
              <label className="schedule-file-picker">
                Excel workbook (.xlsx)
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ''
                    void handleScheduleFile(file)
                  }}
                />
              </label>
              {importing && <p className="schedule-import-status" role="status">Reading workbook…</p>}
              {importError && <p className="schedule-import-errors" role="alert">{importError}</p>}
              {importPreview && (
                <div className="schedule-import-preview">
                  <strong>{importPreview.fileName}</strong>
                  <p>{importPreview.entries.length} class{importPreview.entries.length === 1 ? '' : 'es'} ready to import.</p>
                  {importPreview.errors.length > 0 && (
                    <ul className="schedule-import-errors" role="alert">
                      {importPreview.errors.slice(0, 8).map((error) => <li key={error}>{error}</li>)}
                      {importPreview.errors.length > 8 && <li>And {importPreview.errors.length - 8} more row errors.</li>}
                      <li>Correct the workbook errors and select the file again; no rows have been imported.</li>
                    </ul>
                  )}
                  {importPreview.entries.length > 0 && (
                    <div className="schedule-import-table-wrap">
                      <table className="schedule-import-table">
                        <thead><tr><th>Subject</th><th>Section</th><th>Day</th><th>Time</th></tr></thead>
                        <tbody>
                          {importPreview.entries.slice(0, 5).map((entry, index) => (
                            <tr key={`${entry.code}-${entry.section}-${index}`}>
                              <td>{entry.subject}</td><td>{entry.section}</td><td>{entry.day}</td><td>{entry.start}–{entry.end}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importPreview.entries.length > 5 && <small>Showing 5 of {importPreview.entries.length} classes.</small>}
                    </div>
                  )}
                </div>
              )}
              <div className="schedule-modal-actions">
                <button type="button" className="schedule-cancel-button" onClick={closeImportDialog}>Cancel</button>
                <button
                  type="button"
                  className="schedule-add-button"
                  disabled={!importPreview || importing || importPreview.errors.length > 0}
                  onClick={importSchedule}
                >
                  Import classes
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </SisLayout>
  )
}

export default ClassSchedulePage
