import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  loadAcademicSettings,
  type AcademicSettings,
} from './AcademicSettings'
import { SisIcon, type SisIconName } from './SisIcon'
import './User_Student_Registration.css'

type NavigationItem = {
  label: string
  icon: SisIconName
  href?: string
  activeLabels?: string[]
}

const navigation: { label: string; emoji: string; items: NavigationItem[] }[] = [
  {
    label: '',
    emoji: '',
    items: [{ label: 'Dashboard', icon: 'home', href: '#dashboard' }],
  },
  {
    label: 'STUDENT MANAGEMENT',
    emoji: '👥',
    items: [
      { label: 'Students', icon: 'students', href: '#students' },
      { label: 'Enrollments', icon: 'students', href: '#enrollments' },
      { label: 'Sections', icon: 'sections', href: '#sections' },
      { label: 'Courses', icon: 'courses', href: '#courses' },
      { label: 'Subjects', icon: 'courses', href: '#subjects' },
    ],
  },
  {
    label: 'ACADEMIC',
    emoji: '👨‍🏫',
    items: [
      { label: 'Faculty & Staff', icon: 'users', href: '#users' },
      { label: 'Class Schedule', icon: 'calendar', href: '#class-schedule' },
      { label: 'Grades', icon: 'grades', href: '#grades' },
      {
        label: 'Exam Management',
        icon: 'studentsexam',
        href: "#student's%20exam",
        activeLabels: ["Student's Exam"],
      },
      { label: 'QR Attendance', icon: 'qrcodeattendance', href: '#qr%20attendance' },
    ],
  },
  {
    label: 'STUDENT',
    emoji: '👨‍🎓',
    items: [
      { label: 'My Exams', icon: 'student_own_exam', href: '#my%20exams' },
      { label: 'My Schedule', icon: 'calendar', href: '#my%20schedule' },
      { label: 'My Grades', icon: 'grades', href: '#my%20grades' },
      { label: 'My Attendance', icon: 'qrcodeattendance', href: '#my%20attendance' },
    ],
  },
  {
    label: 'COMMUNICATION',
    emoji: '📢',
    items: [
      { label: 'Announcements', icon: 'reports' },
      { label: 'Notifications', icon: 'reports' },
    ],
  },
  {
    label: 'SERVICES',
    emoji: '📄',
    items: [{ label: 'Document Requests', icon: 'reports' }],
  },
  {
    label: 'REPORTS',
    emoji: '📊',
    items: [{ label: 'Reports', icon: 'reports' }],
  },
  {
    label: 'SYSTEM',
    emoji: '⚙️',
    items: [
      { label: 'Users', icon: 'users', href: '#users' },
      { label: 'Settings', icon: 'settings', href: '#settings' },
    ],
  },
]

type SisLayoutProps = {
  active: string
  breadcrumb: string
  breadcrumbRoot?: string
  breadcrumbHref?: string
  title: string
  subtitle: string
  icon: SisIconName
  children: ReactNode
}

function SisLayout({
  active,
  breadcrumb,
  breadcrumbRoot = 'Dashboard',
  breadcrumbHref = '#dashboard',
  title,
  subtitle,
  icon,
  children,
}: SisLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [academicSettingsState, setAcademicSettingsState] = useState<{
    settings: AcademicSettings | null
    error: string
  }>(() => {
    try {
      return { settings: loadAcademicSettings(), error: '' }
    } catch (error: unknown) {
      return {
        settings: null,
        error: error instanceof Error ? error.message : 'Could not load academic notifications.',
      }
    }
  })
  const adminMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 700px)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 700px)')
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
      setMobileMenuOpen(false)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) return
      if (!adminMenuRef.current?.contains(event.target)) {
        setAdminMenuOpen(false)
      }
      if (!notificationRef.current?.contains(event.target)) {
        setNotificationOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAdminMenuOpen(false)
        setProfileDialogOpen(false)
        setNotificationOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    function refreshAcademicSettings() {
      try {
        setAcademicSettingsState({ settings: loadAcademicSettings(), error: '' })
      } catch (error: unknown) {
        setAcademicSettingsState({
          settings: null,
          error: error instanceof Error ? error.message : 'Could not load academic notifications.',
        })
      }
    }

    window.addEventListener('storage', refreshAcademicSettings)
    window.addEventListener('sis-academic-settings-change', refreshAcademicSettings)
    return () => {
      window.removeEventListener('storage', refreshAcademicSettings)
      window.removeEventListener('sis-academic-settings-change', refreshAcademicSettings)
    }
  }, [])

  const upcomingActivities = academicSettingsState.settings?.activities
    .filter((activity) => activity.endDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.startDate.localeCompare(b.startDate)) ?? []
  const academicPeriodSummary = academicSettingsState.settings
    ? ([
        ['Tertiary', academicSettingsState.settings.periods.tertiary],
        ['Senior High School', academicSettingsState.settings.periods.secondary],
      ] as const)
        .filter(([, period]) => period.startDate && period.endDate)
        .map(([label, period]) => ({
          label,
          range: `${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${period.startDate}T00:00:00`))} – ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${period.endDate}T00:00:00`))}`,
        }))
    : []

  return (
    <div className={`sis-layout${sidebarCollapsed ? ' is-collapsed' : ''}`}>
      <aside className={`sis-sidebar${mobileMenuOpen ? ' is-open' : ''}`}>
        <a
          className="sis-brand"
          href="#dashboard"
          aria-label="PAPSI College Ormoc home"
        >
          <span className="sis-brand-mark">
            <img src="/papsi_logo%20(2).png" alt="" />
          </span>
          <span className="sis-brand-copy">
            <strong>PAPSI College Ormoc</strong>
            <span>Student Information System</span>
          </span>
        </a>

        <nav className="sis-navigation" aria-label="Main navigation">
          {navigation.map((group) => (
            <div className="sis-nav-group" key={group.label || 'dashboard'}>
              {group.label && (
                <h2 className="sis-nav-group-title">
                  <span aria-hidden="true">{group.emoji}</span>
                  <span>{group.label}</span>
                </h2>
              )}
              {group.items.map((item) => {
                const isActive = item.label === active || item.activeLabels?.includes(active)
                const title = sidebarCollapsed
                  ? item.href
                    ? item.label
                    : `${item.label} (Coming soon)`
                  : undefined

                if (!item.href) {
                  return (
                    <span
                      key={item.label}
                      className="sis-nav-link is-disabled"
                      title={title ?? 'Coming soon'}
                      aria-disabled="true"
                    >
                      <SisIcon name={item.icon} />
                      <span>{item.label}</span>
                    </span>
                  )
                }

                return (
                  <a
                    key={item.label}
                    className={`sis-nav-link${isActive ? ' is-active' : ''}`}
                    href={item.href}
                    title={title}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <SisIcon name={item.icon} />
                    <span>{item.label}</span>
                  </a>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
      {mobileMenuOpen && (
        <button
          type="button"
          className="sis-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="sis-main">
        <header className="sis-topbar">
          <button
            type="button"
            className="sis-menu-button"
            aria-label={
              isMobile
                ? mobileMenuOpen
                  ? 'Close navigation'
                  : 'Open navigation'
                : sidebarCollapsed
                  ? 'Expand navigation'
                  : 'Collapse navigation'
            }
            aria-expanded={isMobile ? mobileMenuOpen : !sidebarCollapsed}
            onClick={() => {
              if (isMobile) {
                setMobileMenuOpen((open) => !open)
              } else {
                setSidebarCollapsed((collapsed) => !collapsed)
              }
            }}
          >
            <SisIcon
              name={isMobile && mobileMenuOpen ? 'close' : 'menu'}
            />
          </button>
          <div className="sis-topbar-actions">
            <div className="sis-notification-menu" ref={notificationRef}>
              <button
                type="button"
                className="sis-notification-button"
                aria-label={`Notifications${upcomingActivities.length ? `, ${upcomingActivities.length} upcoming activities` : ''}`}
                aria-haspopup="dialog"
                aria-expanded={notificationOpen}
                onClick={() => setNotificationOpen((open) => !open)}
              >
                <SisIcon name="bell" />
                {upcomingActivities.length > 0 && (
                  <span className="sis-notification-count">
                    {upcomingActivities.length > 9 ? '9+' : upcomingActivities.length}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <section className="sis-notification-popover" role="dialog" aria-label="Upcoming academic activities">
                  <div className="sis-notification-heading">
                    <div>
                      <strong>Academic notifications</strong>
                      {academicPeriodSummary.map((period) => (
                        <span key={period.label}>{period.label}: {period.range}</span>
                      ))}
                    </div>
                    <a href="#settings" onClick={() => setNotificationOpen(false)}>Manage calendar</a>
                  </div>
                  {academicSettingsState.error ? (
                    <p className="sis-notification-empty is-error">{academicSettingsState.error}</p>
                  ) : upcomingActivities.length ? (
                    <ul className="sis-notification-list">
                      {upcomingActivities.slice(0, 8).map((activity) => (
                        <li key={activity.id}>
                          <time dateTime={activity.startDate}>
                            {new Intl.DateTimeFormat(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }).format(new Date(`${activity.startDate}T00:00:00`))}
                            {' – '}
                            {new Intl.DateTimeFormat(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }).format(new Date(`${activity.endDate}T00:00:00`))}
                          </time>
                          <div>
                            <strong>{activity.title}</strong>
                            {activity.details && <span>{activity.details}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="sis-notification-empty">No upcoming academic activities.</p>
                  )}
                </section>
              )}
            </div>
            <div className="sis-admin-menu" ref={adminMenuRef}>
              <button
                type="button"
                className="sis-admin-button"
                aria-haspopup="menu"
                aria-expanded={adminMenuOpen}
                onClick={() => setAdminMenuOpen((open) => !open)}
              >
                <span className="sis-admin-avatar">
                  <SisIcon name="user" />
                </span>
                <span>Admin</span>
                <SisIcon name="chevron" />
              </button>
              {adminMenuOpen && (
                <div className="sis-admin-dropdown" role="menu" aria-label="Admin menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAdminMenuOpen(false)
                      setProfileDialogOpen(true)
                    }}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAdminMenuOpen(false)
                      window.location.hash = '#login'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {profileDialogOpen && (
          <div
            className="sis-profile-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setProfileDialogOpen(false)
            }}
          >
            <section
              className="sis-profile-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sis-profile-title"
            >
              <div className="sis-profile-heading">
                <div>
                  <h2 id="sis-profile-title">Admin profile</h2>
                  <p>Administrator account</p>
                </div>
                <button
                  type="button"
                  aria-label="Close profile"
                  onClick={() => setProfileDialogOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="sis-profile-details">
                <span className="sis-admin-avatar">
                  <SisIcon name="user" />
                </span>
                <div>
                  <strong>Admin</strong>
                  <span>Systems Administrator</span>
                </div>
              </div>
              <p className="sis-profile-note">
                Profile details will be available when administrator accounts
                are connected to the authentication service.
              </p>
            </section>
          </div>
        )}

        <div className="sis-page-content">
          <div className="sis-breadcrumb" aria-label="Breadcrumb">
            <a href={breadcrumbHref}>{breadcrumbRoot}</a>
            <span aria-hidden="true">›</span>
            <span>{breadcrumb}</span>
          </div>

          <div className="sis-page-heading">
            <span className="sis-heading-icon">
              <SisIcon name={icon} />
            </span>
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
        <footer className="sis-project-footer">
          © {new Date().getFullYear()} PAPSI College Ormoc · Student Information System
        </footer>
      </main>
    </div>
  )
}

export default SisLayout
