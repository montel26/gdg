import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import ws from 'ws';
import { readFile } from 'fs/promises';
import { join } from 'path';

// WebSocket support for serverless
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws as any;
}

const sql = neon(process.env.DATABASE_URL!, {
  fetchConnectionCache: true,
  maxConnectionPoolSize: 1
});

interface Database {
  speakers: any[];
  sessions: any[];
  events: any[];
  reviews: any[];
  admins: any[];
}

async function migrateSpeakers(data: Database) {
  let count = 0;
  for (const speaker of data.speakers) {
    try {
      const bio = speaker.bio || null;
      const company = speaker.company || null;
      const twitter = speaker.twitter || null;
      const linkedin = speaker.linkedin || null;
      const github = speaker.github || null;
      
      await sql`
        INSERT INTO speakers (id, name, title, company, bio, image, twitter, linkedin, github, rating, review_count, created_at, updated_at)
        VALUES (${speaker.id}, ${speaker.name}, ${speaker.title}, ${company}, ${bio}, ${speaker.image}, ${twitter}, ${linkedin}, ${github}, ${speaker.rating || 0}, ${speaker.reviewCount || 0}, ${speaker.createdAt}, ${speaker.updatedAt})
        ON CONFLICT (id) DO NOTHING
      `;
      count++;
    } catch (error: any) {
      console.error(`Error migrating speaker ${speaker.id}:`, error.message);
    }
  }
  return `✅ Migrated ${count}/${data.speakers.length} speakers`;
}

async function migrateSessions(data: Database) {
  let count = 0;
  for (const session of data.sessions) {
    try {
      await sql`
        INSERT INTO sessions (id, title, description, start_time, end_time, track, tags, created_at, updated_at)
        VALUES (${session.id}, ${session.title}, ${session.description}, ${session.startTime}, ${session.endTime}, ${session.track}, ${session.tags || []}, ${session.createdAt}, ${session.updatedAt})
        ON CONFLICT (id) DO NOTHING
      `;
      
      if (session.speakerIds && session.speakerIds.length > 0) {
        for (const speakerId of session.speakerIds) {
          await sql`
            INSERT INTO session_speakers (session_id, speaker_id)
            VALUES (${session.id}, ${speakerId})
            ON CONFLICT DO NOTHING
          `;
        }
      }
      count++;
    } catch (error: any) {
      console.error(`Error migrating session ${session.id}:`, error.message);
    }
  }
  return `✅ Migrated ${count}/${data.sessions.length} sessions`;
}

async function migrateEvents(data: Database) {
  let count = 0;
  for (const event of data.events) {
    try {
      await sql`
        INSERT INTO events (id, name, description, date, location, image, created_at, updated_at)
        VALUES (${event.id}, ${event.name}, ${event.description}, ${event.date}, ${event.location}, ${event.image}, ${event.createdAt}, ${event.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          date = EXCLUDED.date,
          location = EXCLUDED.location,
          image = EXCLUDED.image,
          updated_at = EXCLUDED.updated_at
      `;
      count++;
    } catch (error: any) {
      console.error(`Error migrating event ${event.id}:`, error.message);
    }
  }
  return `✅ Migrated ${count}/${data.events.length} events`;
}

async function migrateReviews(data: Database) {
  let count = 0;
  for (const review of data.reviews) {
    try {
      await sql`
        INSERT INTO reviews (id, speaker_id, session_id, user_name, user_email, user_avatar, rating, comment, date, created_at)
        VALUES (${review.id}, ${review.speakerId || null}, ${review.sessionId || null}, ${review.userName}, ${review.userEmail || null}, ${review.userAvatar}, ${review.rating}, ${review.comment}, ${review.date}, ${review.createdAt})
        ON CONFLICT (id) DO NOTHING
      `;
      count++;
    } catch (error: any) {
      console.error(`Error migrating review ${review.id}:`, error.message);
    }
  }
  return `✅ Migrated ${count}/${data.reviews.length} reviews`;
}

async function migrateAdmins(data: Database) {
  let count = 0;
  for (const admin of data.admins) {
    try {
      await sql`
        INSERT INTO admins (id, username, password_hash, created_at)
        VALUES (${admin.id}, ${admin.username}, ${admin.passwordHash}, ${admin.createdAt})
        ON CONFLICT (id) DO NOTHING
      `;
      count++;
    } catch (error: any) {
      console.error(`Error migrating admin ${admin.id}:`, error.message);
    }
  }
  return `✅ Migrated ${count}/${data.admins.length} admins`;
}

export async function POST(request: NextRequest) {
  // Simple security check - you can add a secret token here
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Load data from JSON file
    const dataPath = join(process.cwd(), 'data', 'gdg.json');
    const jsonData = await readFile(dataPath, 'utf-8');
    const data: Database = JSON.parse(jsonData);
    
    const results = [];
    results.push(await migrateSpeakers(data));
    results.push(await migrateSessions(data));
    results.push(await migrateEvents(data));
    results.push(await migrateReviews(data));
    results.push(await migrateAdmins(data));
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    });
    
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

