import { promises as fs } from 'fs'
import { join } from 'path'
import bcrypt from 'bcryptjs'

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data')
const dbPath = join(dataDir, 'gdg.json')

// Types
export interface Speaker {
  id: string
  name: string
  title: string
  company?: string
  
  bio: string
  image: string
  twitter?: string
  linkedin?: string
  github?: string
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  track: string
  speakerIds: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  image: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  speakerId?: string
  sessionId?: string
  userName: string
  userEmail?: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  createdAt: string
}

export interface Admin {
  id: string
  username: string
  passwordHash: string
  createdAt: string
}

interface Database {
  speakers: Speaker[]
  sessions: Session[]
  events: Event[]
  reviews: Review[]
  admins: Admin[]
}

// Initialize database
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

async function readDatabase(): Promise<Database> {
  // Skip database operations during build
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      speakers: [],
      sessions: [],
      events: [],
      reviews: [],
      admins: []
    }
  }
  
  await ensureDataDir()
  
  try {
    const data = await fs.readFile(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return {
      speakers: [],
      sessions: [],
      events: [],
      reviews: [],
      admins: []
    }
  }
}

async function writeDatabase(data: Database): Promise<void> {
  // Skip database operations during build
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return
  }
  
  // Serverless platforms have read-only filesystem
  // Throw clear error instead of failing silently
  if (process.env.VERCEL || process.env.FIREBASE) {
    throw new Error(
      'Database write operations are not supported on serverless platforms. ' +
      'Please configure Firestore or another database for production. ' +
      'See SERVERLESS_DATABASE_ISSUE.md for solutions.'
    )
  }
  
  await ensureDataDir()
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
}


export async function initDatabase() {
  const db = await readDatabase()
  

  if (db.admins.length === 0) {
    // Use environment variables for admin credentials
    // Create .env.local file with:
    // ADMIN_USERNAME=your_username
    // ADMIN_PASSWORD=your_secure_password
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.warn('⚠️  WARNING: Using default admin credentials. Please set ADMIN_USERNAME and ADMIN_PASSWORD in .env.local')
    }
    
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10)
    
    const admin: Admin = {
      id: Date.now().toString(),
      username: adminUsername,
      passwordHash: adminPasswordHash,
      createdAt: new Date().toISOString()
    }
    
    db.admins.push(admin)
    console.log(`Created admin user: ${adminUsername}`)
    console.log('✅ Admin user created. Speakers, sessions, and reviews can be added via the admin panel.')
  } else {
    console.log('✅ Admin user already exists.')
  }
  
  // Automatic data seeding disabled 
  // To enable seeding, remove this early return
  await writeDatabase(db)
  console.log('Database initialization complete!')
  return

  // Removed seeding code - uncomment below to enable automatic seeding
  /*
  if (db.speakers.length === 0) {
    console.log('Seeding initial data...')
    
    const speakers: Omit<Speaker, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: "Sarah Chen",
        title: "Senior Developer Advocate",
        company: "Google",
        bio: "Sarah is a passionate developer advocate specializing in cloud technologies and modern web development.",
        image: "/professional-woman-developer.png",
        twitter: "@sarahchen",
        linkedin: "sarahchen",
        github: "sarahchen"
      },
      {
        name: "Marcus Johnson",
        title: "Lead Android Engineer",
        company: "Spotify",
        bio: "Marcus has been building Android apps for over 10 years and loves sharing his knowledge with the community.",
        image: "/professional-man-developer.png",
        twitter: "@marcusj",
        linkedin: "marcusjohnson",
        github: "marcusj"
      },
      {
        name: "Priya Patel",
        title: "ML Engineer",
        company: "DeepMind",
        bio: "Priya specializes in machine learning and AI, with a focus on making complex topics accessible to everyone.",
        image: "/professional-woman-engineer.png",
        twitter: "@priyaml",
        linkedin: "priyapatel"
      },
      {
        name: "Alex Rivera",
        title: "Cloud Architect",
        company: "Microsoft",
        bio: "Alex helps organizations migrate to the cloud and optimize their infrastructure for performance and cost.",
        image: "/professional-person-cloud-architect.jpg",
        twitter: "@alexrivera",
        linkedin: "alexrivera",
        github: "arivera"
      }
    ]

    const now = new Date().toISOString()
    const createdSpeakers = speakers.map(speaker => ({
      ...speaker,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now
    }))

    db.speakers.push(...createdSpeakers)
    console.log(`Created ${createdSpeakers.length} speakers`)

    
    const sessions: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: "Building Modern Web Apps with Next.js 15",
        description: "Learn about the latest features in Next.js 15 including server components, streaming, and the new app router.",
        startTime: "09:00",
        endTime: "10:00",
        track: "Web",
        speakerIds: [createdSpeakers[0].id],
        tags: ["Next.js", "React", "Web Development"]
      },
      {
        title: "Android Development Best Practices",
        description: "Discover the best practices for building scalable and maintainable Android applications using Kotlin and Jetpack Compose.",
        startTime: "09:00",
        endTime: "10:00",
        track: "Mobile",
        speakerIds: [createdSpeakers[1].id],
        tags: ["Android", "Kotlin", "Mobile"]
      },
      {
        title: "Introduction to Machine Learning with TensorFlow",
        description: "Get started with machine learning using TensorFlow and learn how to build your first neural network.",
        startTime: "10:30",
        endTime: "11:30",
        track: "AI/ML",
        speakerIds: [createdSpeakers[2].id],
        tags: ["Machine Learning", "TensorFlow", "AI"]
      },
      {
        title: "Cloud Architecture Patterns",
        description: "Explore common cloud architecture patterns and learn how to design scalable, resilient systems.",
        startTime: "10:30",
        endTime: "11:30",
        track: "Cloud",
        speakerIds: [createdSpeakers[3].id],
        tags: ["Cloud", "Architecture", "DevOps"]
      },
      {
        title: "Building Accessible Web Applications",
        description: "Learn how to build web applications that are accessible to everyone, including users with disabilities.",
        startTime: "13:00",
        endTime: "14:00",
        track: "Web",
        speakerIds: [createdSpeakers[0].id],
        tags: ["Accessibility", "Web", "UX"]
      },
      {
        title: "Advanced Kotlin Techniques",
        description: "Deep dive into advanced Kotlin features and learn how to write more expressive and efficient code.",
        startTime: "13:00",
        endTime: "14:00",
        track: "Mobile",
        speakerIds: [createdSpeakers[1].id],
        tags: ["Kotlin", "Android", "Programming"]
      },
      {
        title: "Panel: The Future of AI",
        description: "Join our expert panel as they discuss the future of artificial intelligence and its impact on society.",
        startTime: "14:30",
        endTime: "15:30",
        track: "AI/ML",
        speakerIds: [createdSpeakers[2].id, createdSpeakers[0].id],
        tags: ["AI", "Panel", "Future Tech"]
      },
      {
        title: "Serverless Architecture on Google Cloud",
        description: "Learn how to build and deploy serverless applications using Google Cloud Functions and Cloud Run.",
        startTime: "14:30",
        endTime: "15:30",
        track: "Cloud",
        speakerIds: [createdSpeakers[3].id],
        tags: ["Serverless", "Google Cloud", "Cloud Functions"]
      }
    ]

    const createdSessions = sessions.map(session => ({
      ...session,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now
    }))

    db.sessions.push(...createdSessions)
    console.log(`Created ${createdSessions.length} sessions`)

    // Seed event
    const event: Event = {
      id: Date.now().toString(),
      name: "GDG DevFest 2025",
      description: "Join us for a full day of talks, workshops, and networking with fellow developers in the Google Developer Group community.",
      date: "2025-11-01",
      location: "Johannesburg, South Africa",
      image: "/tech-conference-event-banner.jpg",
      createdAt: now,
      updatedAt: now
    }

    db.events.push(event)
    console.log('Created event')

    // Seed reviews
    const reviews: Omit<Review, 'id' | 'createdAt'>[] = [
      {
        speakerId: createdSpeakers[0].id,
        userName: "John Doe",
        userAvatar: "/placeholder.svg?key=u1",
        rating: 5,
        comment: "Sarah's talk on Next.js was incredibly insightful! She explained complex concepts in a way that was easy to understand.",
        date: "2025-10-20"
      },
      {
        speakerId: createdSpeakers[0].id,
        userName: "Emily Zhang",
        userAvatar: "/placeholder.svg?key=u2",
        rating: 5,
        comment: "One of the best speakers I've seen at a tech conference. Great energy and practical examples.",
        date: "2025-10-18"
      },
      {
        speakerId: createdSpeakers[1].id,
        userName: "Lisa Anderson",
        userAvatar: "/placeholder.svg?key=u4",
        rating: 5,
        comment: "Marcus is an amazing teacher! His Android workshop was hands-on and very practical.",
        date: "2025-10-22"
      },
      {
        speakerId: createdSpeakers[2].id,
        userName: "Rachel Green",
        userAvatar: "/placeholder.svg?key=u6",
        rating: 5,
        comment: "Priya made machine learning accessible and fun. Highly recommend her talks!",
        date: "2025-10-21"
      },
      {
        speakerId: createdSpeakers[3].id,
        userName: "Sophie Martin",
        userAvatar: "/placeholder.svg?key=u8",
        rating: 5,
        comment: "Alex's cloud architecture talk was exactly what I needed for my current project.",
        date: "2025-10-23"
      }
    ]

    const createdReviews = reviews.map(review => ({
      ...review,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: now
    }))

    db.reviews.push(...createdReviews)
    console.log(`Created ${createdReviews.length} reviews`)
  } else {
    console.log('Database already has data, skipping seed')
  }

  await writeDatabase(db)
  console.log('Database initialization complete!')
  */ // End of commented seeding code - this section is intentionally disabled
}

// Speaker operations
export const speakerQueries = {
  getAll: async (): Promise<Speaker[]> => {
    const db = await readDatabase()
    return db.speakers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getById: async (id: string): Promise<Speaker | undefined> => {
    const db = await readDatabase()
    return db.speakers.find(speaker => speaker.id === id)
  },

  create: async (speaker: Omit<Speaker, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>): Promise<Speaker> => {
    const db = await readDatabase()
    const now = new Date().toISOString()
    const newSpeaker: Speaker = {
      ...speaker,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now
    }
    db.speakers.push(newSpeaker)
    await writeDatabase(db)
    return newSpeaker
  },

  update: async (id: string, updates: Partial<Speaker>): Promise<void> => {
    const db = await readDatabase()
    const index = db.speakers.findIndex(speaker => speaker.id === id)
    if (index !== -1) {
      db.speakers[index] = {
        ...db.speakers[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await writeDatabase(db)
    }
  },

  delete: async (id: string): Promise<void> => {
    const db = await readDatabase()
    db.speakers = db.speakers.filter(speaker => speaker.id !== id)
    // Also remove speaker from sessions
    db.sessions = db.sessions.map(session => ({
      ...session,
      speakerIds: session.speakerIds.filter(speakerId => speakerId !== id)
    }))
    await writeDatabase(db)
  }
}

// Session operations
export const sessionQueries = {
  getAll: async (): Promise<Session[]> => {
    const db = await readDatabase()
    return db.sessions.sort((a, b) => a.startTime.localeCompare(b.startTime))
  },

  getById: async (id: string): Promise<Session | undefined> => {
    const db = await readDatabase()
    return db.sessions.find(session => session.id === id)
  },

  create: async (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
    const db = await readDatabase()
    const now = new Date().toISOString()
    const newSession: Session = {
      ...session,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now
    }
    db.sessions.push(newSession)
    await writeDatabase(db)
    return newSession
  },

  update: async (id: string, updates: Partial<Session>): Promise<void> => {
    const db = await readDatabase()
    const index = db.sessions.findIndex(session => session.id === id)
    if (index !== -1) {
      db.sessions[index] = {
        ...db.sessions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await writeDatabase(db)
    }
  },

  delete: async (id: string): Promise<void> => {
    const db = await readDatabase()
    db.sessions = db.sessions.filter(session => session.id !== id)
    await writeDatabase(db)
  }
}

// Event operations
export const eventQueries = {
  get: async (): Promise<Event | undefined> => {
    const db = await readDatabase()
    return db.events[0] // Assuming single event
  },

  create: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const db = await readDatabase()
    const now = new Date().toISOString()
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    }
    db.events = [newEvent] // Replace existing event
    await writeDatabase(db)
    return newEvent
  },

  update: async (id: string, updates: Partial<Event>): Promise<void> => {
    const db = await readDatabase()
    const index = db.events.findIndex(event => event.id === id)
    if (index !== -1) {
      db.events[index] = {
        ...db.events[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await writeDatabase(db)
    }
  }
}

// Review operations
export const reviewQueries = {
  getAll: async (): Promise<Review[]> => {
    const db = await readDatabase()
    return db.reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getBySpeakerId: async (speakerId: string): Promise<Review[]> => {
    const db = await readDatabase()
    return db.reviews
      .filter(review => review.speakerId === speakerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getBySessionId: async (sessionId: string): Promise<Review[]> => {
    const db = await readDatabase()
    return db.reviews
      .filter(review => review.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  create: async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    const db = await readDatabase()
    const now = new Date().toISOString()
    const newReview: Review = {
      ...review,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: now
    }
    db.reviews.push(newReview)
    
    // Update speaker rating only if this is a speaker review
    if (review.speakerId) {
      const speakerReviews = db.reviews.filter(r => r.speakerId === review.speakerId)
      const avgRating = speakerReviews.reduce((sum, r) => sum + r.rating, 0) / speakerReviews.length
      const speakerIndex = db.speakers.findIndex(s => s.id === review.speakerId)
      if (speakerIndex !== -1) {
        db.speakers[speakerIndex].rating = Math.round(avgRating * 10) / 10
        db.speakers[speakerIndex].reviewCount = speakerReviews.length
      }
    }
    
    await writeDatabase(db)
    return newReview
  },

  delete: async (id: string): Promise<void> => {
    const db = await readDatabase()
    const review = db.reviews.find(r => r.id === id)
    db.reviews = db.reviews.filter(r => r.id !== id)
    
    // Update speaker rating only if this was a speaker review
    if (review && review.speakerId) {
      const speakerReviews = db.reviews.filter(r => r.speakerId === review.speakerId)
      const avgRating = speakerReviews.length > 0 
        ? speakerReviews.reduce((sum, r) => sum + r.rating, 0) / speakerReviews.length 
        : 0
      const speakerIndex = db.speakers.findIndex(s => s.id === review.speakerId)
      if (speakerIndex !== -1) {
        db.speakers[speakerIndex].rating = Math.round(avgRating * 10) / 10
        db.speakers[speakerIndex].reviewCount = speakerReviews.length
      }
    }
    
    await writeDatabase(db)
  }
}

// Admin operations
export const adminQueries = {
  getByUsername: async (username: string): Promise<Admin | undefined> => {
    const db = await readDatabase()
    return db.admins.find(admin => admin.username === username)
  },

  create: async (admin: Omit<Admin, 'id' | 'createdAt'>): Promise<Admin> => {
    const db = await readDatabase()
    const newAdmin: Admin = {
      ...admin,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    db.admins.push(newAdmin)
    await writeDatabase(db)
    return newAdmin
  }
}

// Initialize database on import (only in server environment)
// Commented out to prevent multiple reinitializations during build
// Call initDatabase() manually or via /api/init endpoint when needed
/*
if (typeof window === 'undefined') {
  initDatabase().catch(console.error)
}
*/