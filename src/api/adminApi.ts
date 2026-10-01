const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
const sessionStorageKey = 'sis.admin.session'
export const ADMIN_SESSION_CHANGED_EVENT = 'sis:admin-session-changed'
export const PORTAL_SESSION_CHANGED_EVENT = 'sis:portal-session-changed'
const portalSessionStorageKey = 'sis.portal.session'

export type AdminSession = {
  accessToken: string
  expiresAt: string
}

export type PortalSession = AdminSession & {
  role: 'User' | 'Student' | 'Faculty' | 'Staff'
}

export type AuthLoginResponse = AdminSession & {
  role: 'Administrator' | 'User' | 'Student' | 'Faculty' | 'Staff'
}

export type StudentRecord = {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  email: string
  enrollmentDate: string
  createdAt: string
}

export type AdminDashboard = {
  studentCount: number
  adminCount: number
  recentStudents: StudentRecord[]
}

export type AdminRecord = {
  id: string
  email: string
}

export type CreateAdminRequest = {
  email: string
  password: string
}

export type PortalUserRecord = {
  id: string
  firstName: string
  lastName: string
  email: string
  positions: { id: string; name: string }[]
  designations: { id: string; name: string }[]
}

export type CreatePortalUserRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  positionIds: string[]
  designationIds: string[]
}

export type UpdatePortalUserRequest = Omit<CreatePortalUserRequest, 'password'>

export type AdminCatalogEntry = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export type AdminCatalogRequest = {
  name: string
  description: string
}

export type AdminCatalogType = 'positions' | 'designations' | 'access-levels'

export class AdminApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

export function getAdminSession(): AdminSession | null {
  const storedSession = window.sessionStorage.getItem(sessionStorageKey)
  if (!storedSession) return null

  try {
    const session: unknown = JSON.parse(storedSession)
    if (
      typeof session === 'object' &&
      session !== null &&
      'accessToken' in session &&
      typeof session.accessToken === 'string' &&
      'expiresAt' in session &&
      typeof session.expiresAt === 'string' &&
      Date.parse(session.expiresAt) > Date.now()
    ) {
      return { accessToken: session.accessToken, expiresAt: session.expiresAt }
    }
  } catch {
    window.sessionStorage.removeItem(sessionStorageKey)
    return null
  }

  window.sessionStorage.removeItem(sessionStorageKey)
  return null
}

export function getCurrentAdminEmail(): string | null {
  const session = getAdminSession()
  if (!session) return null

  try {
    const payload = session.accessToken.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    const claims: unknown = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(decoded, (character) => character.charCodeAt(0))),
    )
    if (
      typeof claims === 'object' &&
      claims !== null &&
      'email' in claims &&
      typeof claims.email === 'string'
    ) {
      return claims.email
    }
  } catch {
    return null
  }

  return null
}

export function saveAdminSession(session: AdminSession): void {
  window.sessionStorage.removeItem(portalSessionStorageKey)
  window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(session))
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT))
  window.dispatchEvent(new Event(PORTAL_SESSION_CHANGED_EVENT))
}

export function clearAdminSession(): void {
  window.sessionStorage.removeItem(sessionStorageKey)
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT))
}

export function getPortalSession(): PortalSession | null {
  const storedSession = window.sessionStorage.getItem(portalSessionStorageKey)
  if (!storedSession) return null
  try {
    const session: unknown = JSON.parse(storedSession)
    if (
      typeof session === 'object' &&
      session !== null &&
      'accessToken' in session &&
      typeof session.accessToken === 'string' &&
      'expiresAt' in session &&
      typeof session.expiresAt === 'string' &&
      Date.parse(session.expiresAt) > Date.now() &&
      'role' in session &&
      (session.role === 'User' || session.role === 'Student' || session.role === 'Faculty' || session.role === 'Staff')
    ) {
      return {
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
        role: session.role,
      }
    }
  } catch {
    window.sessionStorage.removeItem(portalSessionStorageKey)
    return null
  }
  window.sessionStorage.removeItem(portalSessionStorageKey)
  return null
}

export function savePortalSession(session: PortalSession): void {
  window.sessionStorage.removeItem(sessionStorageKey)
  window.sessionStorage.setItem(portalSessionStorageKey, JSON.stringify(session))
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT))
  window.dispatchEvent(new Event(PORTAL_SESSION_CHANGED_EVENT))
}

export function clearPortalSession(): void {
  window.sessionStorage.removeItem(portalSessionStorageKey)
  window.dispatchEvent(new Event(PORTAL_SESSION_CHANGED_EVENT))
}

async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.text()
  if (body) {
    try {
      const problem: unknown = JSON.parse(body)
      if (typeof problem === 'object' && problem !== null) {
        if ('detail' in problem && typeof problem.detail === 'string') return problem.detail
        if ('title' in problem && typeof problem.title === 'string') return problem.title
        if ('errors' in problem && typeof problem.errors === 'object' && problem.errors !== null) {
          const messages = Object.values(problem.errors)
            .filter((value): value is string[] =>
              Array.isArray(value) && value.every((item) => typeof item === 'string'),
            )
            .flat()
          if (messages.length > 0) return messages.join(' ')
        }
      }
    } catch {
      return body
    }
  }
  return `The API request failed (${response.status}).`
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(`${apiBaseUrl}/api/${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) clearAdminSession()
    throw new AdminApiError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const session: unknown = await request<unknown>('admin-auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (
    typeof session !== 'object' ||
    session === null ||
    !('accessToken' in session) ||
    typeof session.accessToken !== 'string' ||
    !('expiresAt' in session) ||
    typeof session.expiresAt !== 'string' ||
    Date.parse(session.expiresAt) <= Date.now()
  ) {
    throw new Error('The API returned an invalid or expired sign-in session.')
  }
  return {
    accessToken: session.accessToken,
    expiresAt: session.expiresAt,
  }
}

export async function signInUser(email: string, password: string): Promise<AuthLoginResponse> {
  const session: unknown = await request<unknown>('auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (
    typeof session !== 'object' ||
    session === null ||
    !('accessToken' in session) ||
    typeof session.accessToken !== 'string' ||
    !('expiresAt' in session) ||
    typeof session.expiresAt !== 'string' ||
    Date.parse(session.expiresAt) <= Date.now() ||
    !('role' in session) ||
    (session.role !== 'Administrator' &&
    session.role !== 'User' &&
    session.role !== 'Student' &&
      session.role !== 'Faculty' &&
      session.role !== 'Staff')
  ) {
    throw new Error('The API returned an invalid or expired sign-in session.')
  }
  return {
    accessToken: session.accessToken,
    expiresAt: session.expiresAt,
    role: session.role,
  }
}

export function getAdminDashboard(
  accessToken: string,
  signal?: AbortSignal,
): Promise<AdminDashboard> {
  return request<AdminDashboard>('admin/dashboard', { signal }, accessToken)
}

export function logoutAdmin(accessToken: string): Promise<void> {
  return request<void>('admin-auth/logout', { method: 'POST' }, accessToken)
}

export function getAdmins(
  accessToken: string,
  signal?: AbortSignal,
): Promise<AdminRecord[]> {
  return request<AdminRecord[]>('admins', { signal }, accessToken)
}

export function createAdmin(
  accessToken: string,
  requestBody: CreateAdminRequest,
): Promise<AdminRecord> {
  return request<AdminRecord>('admins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  }, accessToken)
}

export function getPortalUsers(
  accessToken: string,
  signal?: AbortSignal,
): Promise<PortalUserRecord[]> {
  return request<PortalUserRecord[]>('admin/portal-users', { signal }, accessToken)
}

export function createPortalUser(
  accessToken: string,
  requestBody: CreatePortalUserRequest,
): Promise<PortalUserRecord> {
  return request<PortalUserRecord>('admin/portal-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  }, accessToken)
}

export function updatePortalUser(
  accessToken: string,
  userId: string,
  requestBody: UpdatePortalUserRequest,
): Promise<PortalUserRecord> {
  return request<PortalUserRecord>(`admin/portal-users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  }, accessToken)
}

export function resetPortalUserPassword(
  accessToken: string,
  userId: string,
  password: string,
): Promise<void> {
  return request<void>(`admin/portal-users/${encodeURIComponent(userId)}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }, accessToken)
}

export function deletePortalUser(accessToken: string, userId: string): Promise<void> {
  return request<void>(`admin/portal-users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  }, accessToken)
}

export function deleteAdmin(accessToken: string, adminId: string): Promise<void> {
  return request<void>(`admins/${encodeURIComponent(adminId)}`, {
    method: 'DELETE',
  }, accessToken)
}

export function getAdminCatalog(
  accessToken: string,
  catalogType: AdminCatalogType,
  signal?: AbortSignal,
): Promise<AdminCatalogEntry[]> {
  return request<AdminCatalogEntry[]>(
    `admin/catalogs/${catalogType}`,
    { signal },
    accessToken,
  )
}

export function createAdminCatalogEntry(
  accessToken: string,
  catalogType: AdminCatalogType,
  requestBody: AdminCatalogRequest,
): Promise<AdminCatalogEntry> {
  return request<AdminCatalogEntry>(`admin/catalogs/${catalogType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  }, accessToken)
}

export function updateAdminCatalogEntry(
  accessToken: string,
  catalogType: AdminCatalogType,
  id: string,
  requestBody: AdminCatalogRequest,
): Promise<AdminCatalogEntry> {
  return request<AdminCatalogEntry>(
    `admin/catalogs/${catalogType}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    },
    accessToken,
  )
}

export function deleteAdminCatalogEntry(
  accessToken: string,
  catalogType: AdminCatalogType,
  id: string,
): Promise<void> {
  return request<void>(
    `admin/catalogs/${catalogType}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    accessToken,
  )
}
