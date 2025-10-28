import bcrypt from 'bcryptjs'
import { adminQueries, speakerQueries, sessionQueries, eventQueries, reviewQueries } from '../lib/db'

async function initializeDatabase() {
  console.log('Initializing database...')

  // Create default admin user
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10)

  // Check if admin already exists
  const existingAdmin = adminQueries.getByUsername(adminUsername)
  if (!existingAdmin) {
    adminQueries.create({
      username: adminUsername,
      passwordHash: adminPasswordHash
    })
    console.log(`Created admin user: ${adminUsername}`)
  } else {
    console.log(`Admin user already exists: ${adminUsername}`)
  }

  // Check if we have any data, if not, seed with initial data
  const existingSpeakers = speakerQueries.getAll()
  if (existingSpeakers.length === 0) {
    console.log('Seeding initial data...')
    
    // Seed speakers
    const speakers = [
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

    const createdSpeakers = speakers.map(speaker => speakerQueries.create(speaker))
    console.log(`Created ${createdSpeakers.length} speakers`)

    // Seed sessions
    const sessions = [
      {
        title: "Building Modern Web Apps with Next.js 15",
        description: "Learn about the latest features in Next.js 15 including server components, streaming, and the new app router.",
        startTime: "09:00",
        endTime: "10:00",
        track: "Web",
        room: "Main Hall",
        speakerIds: [createdSpeakers[0].id],
        tags: ["Next.js", "React", "Web Development"]
      },
      {
        title: "Android Development Best Practices",
        description: "Discover the best practices for building scalable and maintainable Android applications using Kotlin and Jetpack Compose.",
        startTime: "09:00",
        endTime: "10:00",
        track: "Mobile",
        room: "Room A",
        speakerIds: [createdSpeakers[1].id],
        tags: ["Android", "Kotlin", "Mobile"]
      },
      {
        title: "Introduction to Machine Learning with TensorFlow",
        description: "Get started with machine learning using TensorFlow and learn how to build your first neural network.",
        startTime: "10:30",
        endTime: "11:30",
        track: "AI/ML",
        room: "Room B",
        speakerIds: [createdSpeakers[2].id],
        tags: ["Machine Learning", "TensorFlow", "AI"]
      },
      {
        title: "Cloud Architecture Patterns",
        description: "Explore common cloud architecture patterns and learn how to design scalable, resilient systems.",
        startTime: "10:30",
        endTime: "11:30",
        track: "Cloud",
        room: "Main Hall",
        speakerIds: [createdSpeakers[3].id],
        tags: ["Cloud", "Architecture", "DevOps"]
      }
    ]

    sessions.forEach(session => sessionQueries.create(session))
    console.log(`Created ${sessions.length} sessions`)

    // Seed event
    const event = {
      name: "GDG DevFest 2025",
      description: "Join us for a full day of talks, workshops, and networking with fellow developers in the Google Developer Group community.",
      date: "2025-11-01",
      location: "Johannesburg, South Africa",
      image: "/tech-conference-event-banner.jpg"
    }

    eventQueries.create(event)
    console.log('Created event')

    // Seed reviews
    const reviews = [
      {
        speakerId: createdSpeakers[0].id,
        userName: "John Doe",
        userAvatar: "/placeholder.svg?key=u1",
        rating: 5,
        comment: "Sarah's talk on Next.js was incredibly insightful! She explained complex concepts in a way that was easy to understand.",
        date: "2025-10-20"
      },
      {
        speakerId: createdSpeakers[1].id,
        userName: "Lisa Anderson",
        userAvatar: "/placeholder.svg?key=u4",
        rating: 5,
        comment: "Marcus is an amazing teacher! His Android workshop was hands-on and very practical.",
        date: "2025-10-22"
      }
    ]

    reviews.forEach(review => reviewQueries.create(review))
    console.log(`Created ${reviews.length} reviews`)
  } else {
    console.log('Database already has data, skipping seed')
  }

  console.log('Database initialization complete!')
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error)
}

export default initializeDatabase
