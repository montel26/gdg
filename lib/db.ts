import { getSql, cleanEmptyStrings } from './neon';
import { executeQuery, executeQueryOne } from './db-queries';
import bcrypt from 'bcryptjs';

export interface Speaker {
  id: string
  name: string
  title: string
  company?: string
  bio?: string
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

// Speaker operations
export const speakerQueries = {
  getAll: async (): Promise<Speaker[]> => {
    const rows = await executeQuery<Speaker>(`
      SELECT 
        id, name, title, company, bio, image, twitter, linkedin, github,
        rating, review_count as "reviewCount",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM speakers
      ORDER BY created_at DESC
    `);
    return rows;
  },

  getById: async (id: string): Promise<Speaker | undefined> => {
    const speaker = await executeQueryOne<Speaker>(`
      SELECT 
        id, name, title, company, bio, image, twitter, linkedin, github,
        rating, review_count as "reviewCount",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM speakers
      WHERE id = $1
    `, [id]);
    return speaker || undefined;
  },

  create: async (speaker: Omit<Speaker, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>): Promise<Speaker> => {
    const client = getSql();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    // Clean empty strings to NULL
    const bio = cleanEmptyStrings(speaker.bio);
    
    await client.query(`
      INSERT INTO speakers (
        id, name, title, company, bio, image, twitter, linkedin, github,
        rating, review_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      id, speaker.name, speaker.title, 
      cleanEmptyStrings(speaker.company),
      bio, speaker.image, 
      cleanEmptyStrings(speaker.twitter),
      cleanEmptyStrings(speaker.linkedin),
      cleanEmptyStrings(speaker.github),
      0, 0, now, now
    ]);
    
    return { ...speaker, id, rating: 0, reviewCount: 0, createdAt: now, updatedAt: now };
  },

  update: async (id: string, updates: Partial<Speaker>): Promise<void> => {
    const client = getSql();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const allowedFields = ['name', 'title', 'company', 'bio', 'image', 'twitter', 'linkedin', 'github'];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(cleanEmptyStrings(value));
      }
    }
    
    if (fields.length > 0) {
      fields.push(`updated_at = $${paramIndex++}`);
      values.push(now);
      values.push(id);
      
      await client.query(`
        UPDATE speakers 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
      `, values);
    }
  },

  delete: async (id: string): Promise<void> => {
    const client = getSql();
    await client.query('DELETE FROM speakers WHERE id = $1', [id]);
  }
}

// Session operations
export const sessionQueries = {
  getAll: async (): Promise<Session[]> => {
    const rows = await executeQuery<Session>(`
      SELECT 
        s.id, s.title, s.description, s.start_time as "startTime",
        s.end_time as "endTime", s.track, s.tags,
        s.created_at as "createdAt", s.updated_at as "updatedAt",
        ARRAY_AGG(DISTINCT ss.speaker_id) FILTER (WHERE ss.speaker_id IS NOT NULL) as "speakerIds"
      FROM sessions s
      LEFT JOIN session_speakers ss ON s.id = ss.session_id
      GROUP BY s.id
      ORDER BY s.start_time
    `);
    
    // Transform the aggregated speaker IDs
    return rows.map((row: any) => ({
      ...row,
      speakerIds: row.speakerIds || []
    })) as Session[];
  },

  getById: async (id: string): Promise<Session | undefined> => {
    const rows = await executeQuery<Session>(`
      SELECT 
        s.id, s.title, s.description, s.start_time as "startTime",
        s.end_time as "endTime", s.track, s.tags,
        s.created_at as "createdAt", s.updated_at as "updatedAt",
        ARRAY_AGG(ss.speaker_id) FILTER (WHERE ss.speaker_id IS NOT NULL) as "speakerIds"
      FROM sessions s
      LEFT JOIN session_speakers ss ON s.id = ss.session_id
      WHERE s.id = $1
      GROUP BY s.id
    `, [id]);
    
    const session = rows[0];
    if (!session) return undefined;
    
    return {
      ...session,
      speakerIds: session.speakerIds || []
    } as Session;
  },

  create: async (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
    const client = getSql();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO sessions (
        id, title, description, start_time, end_time, track, tags, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [id, session.title, session.description, session.startTime, session.endTime, 
        session.track, session.tags, now, now]);
    
    // Insert session-speaker relationships
    if (session.speakerIds && session.speakerIds.length > 0) {
      for (const speakerId of session.speakerIds) {
        await client.query(`
          INSERT INTO session_speakers (session_id, speaker_id)
          VALUES ($1, $2)
        `, [id, speakerId]);
      }
    }
    
    return { ...session, id, createdAt: now, updatedAt: now };
  },

  update: async (id: string, updates: Partial<Session>): Promise<void> => {
    const client = getSql();
    const now = new Date().toISOString();
    
    const { speakerIds, ...sessionUpdates } = updates;
    
    // Update session fields
    if (Object.keys(sessionUpdates).length > 0) {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      const allowedFields = ['title', 'description', 'startTime', 'endTime', 'track', 'tags'];
      for (const [key, value] of Object.entries(sessionUpdates)) {
        let dbKey = key;
        if (key === 'startTime') dbKey = 'start_time';
        if (key === 'endTime') dbKey = 'end_time';
        
        if (allowedFields.includes(key) && value !== undefined) {
          fields.push(`${dbKey} = $${paramIndex++}`);
          values.push(value);
        }
      }
      
      if (fields.length > 0) {
        fields.push(`updated_at = $${paramIndex++}`);
        values.push(now);
        values.push(id);
        
        await client.query(`
          UPDATE sessions 
          SET ${fields.join(', ')}
          WHERE id = $${paramIndex}
        `, values);
      }
    }
    
    // Update speaker relationships if provided
    if (speakerIds !== undefined) {
      await client.query('DELETE FROM session_speakers WHERE session_id = $1', [id]);
      
      if (speakerIds.length > 0) {
        for (const speakerId of speakerIds) {
          await client.query(`
            INSERT INTO session_speakers (session_id, speaker_id)
            VALUES ($1, $2)
          `, [id, speakerId]);
        }
      }
    }
  },

  delete: async (id: string): Promise<void> => {
    const client = getSql();
    await client.query('DELETE FROM sessions WHERE id = $1', [id]);
  }
}

// Event operations
export const eventQueries = {
  get: async (): Promise<Event | undefined> => {
    const client = getSql();
    const rows = await client.query(`
      SELECT 
        id, name, description, date, location, image,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM events
      LIMIT 1
    `);
    return rows[0] as Event | undefined;
  },

  create: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const client = getSql();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO events (id, name, description, date, location, image, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, event.name, event.description, event.date, event.location, event.image, now, now]);
    
    return { ...event, id, createdAt: now, updatedAt: now };
  },

  update: async (id: string, updates: Partial<Event>): Promise<void> => {
    const client = getSql();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const allowedFields = ['name', 'description', 'date', 'location', 'image'];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }
    
    if (fields.length > 0) {
      fields.push(`updated_at = $${paramIndex++}`);
      values.push(now);
      values.push(id);
      
      await client.query(`
        UPDATE events 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
      `, values);
    }
  }
}

// Review operations
export const reviewQueries = {
  getAll: async (): Promise<Review[]> => {
    const client = getSql();
    const rows = await client.query(`
      SELECT 
        id, speaker_id as "speakerId", session_id as "sessionId",
        user_name as "userName", user_email as "userEmail", user_avatar as "userAvatar",
        rating, comment, date, created_at as "createdAt"
      FROM reviews
      ORDER BY created_at DESC
    `);
    return rows as Review[];
  },

  getBySpeakerId: async (speakerId: string): Promise<Review[]> => {
    const client = getSql();
    const rows = await client.query(`
      SELECT 
        id, speaker_id as "speakerId", session_id as "sessionId",
        user_name as "userName", user_email as "userEmail", user_avatar as "userAvatar",
        rating, comment, date, created_at as "createdAt"
      FROM reviews
      WHERE speaker_id = $1
      ORDER BY created_at DESC
    `, [speakerId]);
    return rows as Review[];
  },

  getBySessionId: async (sessionId: string): Promise<Review[]> => {
    const client = getSql();
    const rows = await client.query(`
      SELECT 
        id, speaker_id as "speakerId", session_id as "sessionId",
        user_name as "userName", user_email as "userEmail", user_avatar as "userAvatar",
        rating, comment, date, created_at as "createdAt"
      FROM reviews
      WHERE session_id = $1
      ORDER BY created_at DESC
    `, [sessionId]);
    return rows as Review[];
  },

  create: async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    const client = getSql();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO reviews (
        id, speaker_id, session_id, user_name, user_email, user_avatar,
        rating, comment, date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      id, review.speakerId || null, review.sessionId || null,
      review.userName, review.userEmail || null, review.userAvatar,
      review.rating, review.comment, review.date, now
    ]);
    
    // Update speaker rating if this is a speaker review
    if (review.speakerId) {
      await client.query(`
        UPDATE speakers 
        SET rating = (
          SELECT ROUND(AVG(rating)::numeric, 1)
          FROM reviews 
          WHERE reviews.speaker_id = speakers.id
        ),
        review_count = (
          SELECT COUNT(*)
          FROM reviews 
          WHERE reviews.speaker_id = speakers.id
        )
        WHERE id = $1
      `, [review.speakerId]);
    }
    
    return { ...review, id, createdAt: now };
  },

  delete: async (id: string): Promise<void> => {
    const client = getSql();
    
    // Get the review first to update speaker ratings
    const rows = await client.query(`
      SELECT speaker_id FROM reviews WHERE id = $1
    `, [id]);
    const speakerId = rows[0]?.speaker_id;
    
    await client.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    // Update speaker rating if this was a speaker review
    if (speakerId) {
      await client.query(`
        UPDATE speakers 
        SET rating = COALESCE((
          SELECT ROUND(AVG(rating)::numeric, 1)
          FROM reviews 
          WHERE reviews.speaker_id = speakers.id
        ), 0),
        review_count = (
          SELECT COUNT(*)
          FROM reviews 
          WHERE reviews.speaker_id = speakers.id
        )
        WHERE id = $1
      `, [speakerId]);
    }
  }
}

// Admin operations
export const adminQueries = {
  getByUsername: async (username: string): Promise<Admin | undefined> => {
    const client = getSql();
    const rows = await client.query(`
      SELECT 
        id, username, password_hash as "passwordHash",
        created_at as "createdAt"
      FROM admins
      WHERE username = $1
    `, [username]);
    return rows[0] as Admin | undefined;
  },

  create: async (admin: Omit<Admin, 'id' | 'createdAt'>): Promise<Admin> => {
    const client = getSql();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO admins (id, username, password_hash, created_at)
      VALUES ($1, $2, $3, $4)
    `, [id, admin.username, admin.passwordHash, now]);
    
    return { ...admin, id, createdAt: now };
  }
}

// Initialize database (create admin if needed)
export async function initDatabase() {
  const client = getSql();
  
  // Check if admin exists
  const admins = await client.query('SELECT COUNT(*) as count FROM admins');
  const adminCount = admins[0].count || 0;
  
  if (adminCount === 0) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.warn('⚠️  WARNING: Using default admin credentials. Please set ADMIN_USERNAME and ADMIN_PASSWORD in .env.local');
    }
    
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO admins (id, username, password_hash, created_at)
      VALUES ($1, $2, $3, $4)
    `, [id, adminUsername, adminPasswordHash, now]);
    
    console.log(`Created admin user: ${adminUsername}`);
    console.log('✅ Admin user created. Speakers, sessions, and reviews can be added via the admin panel.');
  } else {
    console.log('✅ Admin user already exists.');
  }
  
  console.log('Database initialization complete!');
}

