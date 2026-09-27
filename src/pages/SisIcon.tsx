export type SisIconName =
  | 'dashboard'
  | 'students'
  | 'users'
  | 'courses'
  | 'sections'
  | 'grades'
  | 'qrcodeattendance'
  | 'reports'
  | 'settings'
  | 'user'
  | 'shield'
  | 'eye'
  | 'eyeOff'
  | 'chevron'
  | 'calendar'
  | 'close'
  | 'menu'
  | 'cap'
  | 'studentsexam'
  | 'student_own_exam'
  | 'home'
  | 'bell'
const iconPaths: Record<SisIconName, string> = {
  dashboard: 'M3 3h8v8H3zM14 3h7v5h-7zM14 11h7v10h-7zM3 14h8v7H3z',
  students:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  courses:
    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  sections: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  grades: 'M4 19V9m6 10V5m6 14v-7m6 7V3',
  qrcodeattendance:
    'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v2h-2zM19 19h2v2h-2zM14 19h2v2h-2z',
  reports:
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 13h8m-8 4h8',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-6v3m0 14v3m10-10h-3M5 12H2m17.07-7.07-2.12 2.12M7.05 16.95l-2.12 2.12m14.14 0-2.12-2.12M7.05 7.05 4.93 4.93',
  studentsexam: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  student_own_exam:
    'M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2zm2 5h6m-6 4h6',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  user: 'M20 21v-2a8 8 0 0 0-16 0v2m8-10a5 5 0 1 0 0-10 5 5 0 0 0 0 10',
  shield: 'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11zm-3-11 2 2 4-4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff:
    'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.7M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8',
  chevron: 'm6 9 6 6 6-6',
  calendar:
    'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z',
  close: 'M18 6 6 18M6 6l12 12',
  menu: 'M4 6h16M4 12h16M4 18h16',
  cap: 'm2 10 10-5 10 5-10 5-10-5zm4 2v5c3.5 3 8.5 3 12 0v-5m4-2v6',
}

export function SisIcon({
  name,
  className,
}: {
  name: SisIconName
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}