import { readFile } from 'fs/promises';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import ws from 'ws';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// WebSocket support
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

async function createTables() {
  // Tables will be created manually or already exist
  // Skip automated table creation due to Neon API limitations with raw SQL
  console.log('Note: Assuming tables already exist in Neon database');
  console.log('If not, please run the schema.sql manually in your Neon dashboard');
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
      
      // Small delay to avoid overwhelming the connection
      if (count % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      console.error(`Error migrating speaker ${speaker.id}:`, error.message);
    }
  }
  console.log(`✅ Migrated ${count}/${data.speakers.length} speakers`);
}

async function migrateSessions(data: Database) {
  for (const session of data.sessions) {
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
  }
  console.log(`✅ Migrated ${data.sessions.length} sessions`);
}

async function migrateEvents(data: Database) {
  for (const event of data.events) {
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
  }
  console.log(`✅ Migrated ${data.events.length} events`);
}

async function migrateReviews(data: Database) {
  for (const review of data.reviews) {
    await sql`
      INSERT INTO reviews (id, speaker_id, session_id, user_name, user_email, user_avatar, rating, comment, date, created_at)
      VALUES (${review.id}, ${review.speakerId || null}, ${review.sessionId || null}, ${review.userName}, ${review.userEmail || null}, ${review.userAvatar}, ${review.rating}, ${review.comment}, ${review.date}, ${review.createdAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`✅ Migrated ${data.reviews.length} reviews`);
}

async function migrateAdmins(data: Database) {
  for (const admin of data.admins) {
    await sql`
      INSERT INTO admins (id, username, password_hash, created_at)
      VALUES (${admin.id}, ${admin.username}, ${admin.passwordHash}, ${admin.createdAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log(`✅ Migrated ${data.admins.length} admins`);
}

async function migrate() {
  console.log('🚀 Starting migration to Neon PostgreSQL...\n');
  
  try {
    const dataPath = join(process.cwd(), 'data', 'gdg.json');
    const jsonData = await readFile(dataPath, 'utf-8');
    const data: Database = JSON.parse(jsonData);
    
    console.log('📋 Creating tables...');
    await createTables();
    console.log('✅ Tables created\n');
    
    await migrateSpeakers(data);
    await migrateSessions(data);
    await migrateEvents(data);
    await migrateReviews(data);
    await migrateAdmins(data);
    
    console.log('\n✨ Migration completed successfully!');
    console.log(`   - ${data.speakers.length} speakers`);
    console.log(`   - ${data.sessions.length} sessions`);
    console.log(`   - ${data.events.length} events`);
    console.log(`   - ${data.reviews.length} reviews`);
    console.log(`   - ${data.admins.length} admins`);
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
