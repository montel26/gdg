export interface Speaker {
  id: string
  name: string
  title: string
  company: string
  bio: string
  image: string
  twitter?: string
  linkedin?: string
  github?: string
  rating: number
  reviewCount: number
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
}

export interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  image: string
}

export interface Review {
  id: string
  speakerId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
}

export const speakers: Speaker[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Developer Advocate",
    company: "Google",
    bio: "Sarah is a passionate developer advocate specializing in cloud technologies and modern web development.",
    image: "/generated-speaker-image-1.png",
    twitter: "@sarahchen",
    linkedin: "sarahchen",
    github: "sarahchen",
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    title: "Lead Android Engineer",
    company: "Spotify",
    bio: "Marcus has been building Android apps for over 10 years and loves sharing his knowledge with the community.",
    image: "/generated-speaker-image-2.png",
    twitter: "@marcusj",
    linkedin: "marcusjohnson",
    github: "marcusj",
    rating: 4.9,
    reviewCount: 31,
  },
  {
    id: "3",
    name: "Priya Patel",
    title: "ML Engineer",
    company: "DeepMind",
    bio: "Priya specializes in machine learning and AI, with a focus on making complex topics accessible to everyone.",
    image: "/generated-speaker-image-3.png",
    twitter: "@priyaml",
    linkedin: "priyapatel",
    rating: 4.7,
    reviewCount: 18,
  },
  {
    id: "4",
    name: "Alex Rivera",
    title: "Cloud Architect",
    company: "Microsoft",
    bio: "Alex helps organizations migrate to the cloud and optimize their infrastructure for performance and cost.",
    image: "/generated-speaker-image-4.png",
    twitter: "@alexrivera",
    linkedin: "alexrivera",
    github: "arivera",
    rating: 4.6,
    reviewCount: 15,
  },
]

export const sessions: Session[] = [
  {
    id: "1",
    title: "Building Modern Web Apps with Next.js 15",
    description:
      "Learn about the latest features in Next.js 15 including server components, streaming, and the new app router.",
    startTime: "09:00",
    endTime: "10:00",
    track: "Web",
    speakerIds: ["1"],
    tags: ["Next.js", "React", "Web Development"],
  },
  {
    id: "2",
    title: "Android Development Best Practices",
    description:
      "Discover the best practices for building scalable and maintainable Android applications using Kotlin and Jetpack Compose.",
    startTime: "09:00",
    endTime: "10:00",
    track: "Mobile",
    speakerIds: ["2"],
    tags: ["Android", "Kotlin", "Mobile"],
  },
  {
    id: "3",
    title: "Introduction to Machine Learning with TensorFlow",
    description: "Get started with machine learning using TensorFlow and learn how to build your first neural network.",
    startTime: "10:30",
    endTime: "11:30",
    track: "AI/ML",
    speakerIds: ["3"],
    tags: ["Machine Learning", "TensorFlow", "AI"],
  },
  {
    id: "4",
    title: "Cloud Architecture Patterns",
    description: "Explore common cloud architecture patterns and learn how to design scalable, resilient systems.",
    startTime: "10:30",
    endTime: "11:30",
    track: "Cloud",
    speakerIds: ["4"],
    tags: ["Cloud", "Architecture", "DevOps"],
  },
  {
    id: "5",
    title: "Building Accessible Web Applications",
    description:
      "Learn how to build web applications that are accessible to everyone, including users with disabilities.",
    startTime: "13:00",
    endTime: "14:00",
    track: "Web",
    speakerIds: ["1"],
    tags: ["Accessibility", "Web", "UX"],
  },
  {
    id: "6",
    title: "Advanced Kotlin Techniques",
    description: "Deep dive into advanced Kotlin features and learn how to write more expressive and efficient code.",
    startTime: "13:00",
    endTime: "14:00",
    track: "Mobile",
    speakerIds: ["2"],
    tags: ["Kotlin", "Android", "Programming"],
  },
  {
    id: "7",
    title: "Panel: The Future of AI",
    description:
      "Join our expert panel as they discuss the future of artificial intelligence and its impact on society.",
    startTime: "14:30",
    endTime: "15:30",
    track: "AI/ML",
    speakerIds: ["3", "1"],
    tags: ["AI", "Panel", "Future Tech"],
  },
  {
    id: "8",
    title: "Serverless Architecture on Google Cloud",
    description: "Learn how to build and deploy serverless applications using Google Cloud Functions and Cloud Run.",
    startTime: "14:30",
    endTime: "15:30",
    track: "Cloud",
    speakerIds: ["4"],
    tags: ["Serverless", "Google Cloud", "Cloud Functions"],
  },
]

export const event: Event = {
  id: "1",
  name: "GDG DevFest 2025",
  description:
    "Join us for a full day of talks, workshops, and networking with fellow developers in the Google Developer Group community.",
  date: "2025-11-1",
  location: "Johannesburg, South Africa",
  image: "/tech-conference-event-banner.jpg",
}

export const reviews: Review[] = [
  {
    id: "1",
    speakerId: "1",
    userName: "John Doe",
    userAvatar: "/placeholder.svg?key=u1",
    rating: 5,
    comment:
      "Sarah's talk on Next.js was incredibly insightful! She explained complex concepts in a way that was easy to understand.",
    date: "2025-10-20",
  },
  {
    id: "2",
    speakerId: "1",
    userName: "Emily Zhang",
    userAvatar: "/placeholder.svg?key=u2",
    rating: 5,
    comment: "One of the best speakers I've seen at a tech conference. Great energy and practical examples.",
    date: "2025-10-18",
  },
  {
    id: "3",
    speakerId: "1",
    userName: "Michael Brown",
    userAvatar: "/placeholder.svg?key=u3",
    rating: 4,
    comment: "Really enjoyed the session. Would have loved more time for Q&A though.",
    date: "2025-10-15",
  },
  {
    id: "4",
    speakerId: "2",
    userName: "Lisa Anderson",
    userAvatar: "/placeholder.svg?key=u4",
    rating: 5,
    comment: "Marcus is an amazing teacher! His Android workshop was hands-on and very practical.",
    date: "2025-10-22",
  },
  {
    id: "5",
    speakerId: "2",
    userName: "David Kim",
    userAvatar: "/placeholder.svg?key=u5",
    rating: 5,
    comment: "Best Android session I've attended. Marcus really knows his stuff!",
    date: "2025-10-19",
  },
  {
    id: "6",
    speakerId: "3",
    userName: "Rachel Green",
    userAvatar: "/placeholder.svg?key=u6",
    rating: 5,
    comment: "Priya made machine learning accessible and fun. Highly recommend her talks!",
    date: "2025-10-21",
  },
  {
    id: "7",
    speakerId: "3",
    userName: "Tom Wilson",
    userAvatar: "/placeholder.svg?key=u7",
    rating: 4,
    comment: "Great introduction to ML. Looking forward to more advanced topics in the future.",
    date: "2025-10-17",
  },
  {
    id: "8",
    speakerId: "4",
    userName: "Sophie Martin",
    userAvatar: "/placeholder.svg?key=u8",
    rating: 5,
    comment: "Alex's cloud architecture talk was exactly what I needed for my current project.",
    date: "2025-10-23",
  },
]

export function getSpeakerById(id: string): Speaker | undefined {
  return speakers.find((speaker) => speaker.id === id)
}

export function getSessionsBySpeakerId(speakerId: string): Session[] {
  return sessions.filter((session) => session.speakerIds.includes(speakerId))
}

export function getReviewsBySpeakerId(speakerId: string): Review[] {
  return reviews.filter((review) => review.speakerId === speakerId)
}
