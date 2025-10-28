import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { adminQueries } from './db'

const SESSION_COOKIE_NAME = 'gdg-admin-session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-key'

export interface SessionData {
  adminId: string
  username: string
  loginTime: number
}


function encodeSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64')
  const signature = Buffer.from(SESSION_SECRET).toString('base64')
  return `${payload}.${signature}`
}

function decodeSession(token: string): SessionData | null {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null
    
    const expectedSignature = Buffer.from(SESSION_SECRET).toString('base64')
    if (signature !== expectedSignature) return null
    
    const data = JSON.parse(Buffer.from(payload, 'base64').toString())
    
    // Check if session is not too old (1 hour)
    const maxAge = 60 * 60 * 1000 // 1 hour in milliseconds
    if (Date.now() - data.loginTime > maxAge) {
      return null
    }
    
    return data
  } catch {
    return null
  }
}

export async function createSession(adminId: string, username: string): Promise<string> {
  const sessionData: SessionData = {
    adminId,
    username,
    loginTime: Date.now()
  }
  
  return encodeSession(sessionData)
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionToken) return null
  
  return decodeSession(sessionToken)
}

export async function setSessionCookie(sessionToken: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 // 1 hour
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function verifyCredentials(username: string, password: string): Promise<{ success: boolean; adminId?: string }> {
  try {
    const admin = await adminQueries.getByUsername(username)
    
    if (!admin) {
      return { success: false }
    }
    
    const isValid = await bcrypt.compare(password, admin.passwordHash)
    
    if (isValid) {
      return { success: true, adminId: admin.id }
    }
    
    return { success: false }
  } catch (error) {
    console.error('Error verifying credentials:', error)
    return { success: false }
  }
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return session
}

// Client-side session management
export function setClientSession(sessionToken: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_COOKIE_NAME}=${sessionToken}; path=/; max-age=${60 * 60}; SameSite=Lax`
  }
}

export function clearClientSession() {
  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

export function getClientSession(): string | null {
  if (typeof window === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
  )
  
  if (sessionCookie) {
    return sessionCookie.split('=')[1]
  }
  
  return null
}
