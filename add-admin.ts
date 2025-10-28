#!/usr/bin/env tsx
/**
 * Script to add admin users to the database
 * Usage: npx tsx add-admin.ts <username> <password>
 */

import bcrypt from 'bcryptjs'
import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Go up from add-admin.ts to project root, then to data/gdg.json
const projectRoot = __dirname
const dataDir = join(projectRoot, 'data')
const dbPath = join(dataDir, 'gdg.json')

interface Admin {
  id: string
  username: string
  passwordHash: string
  createdAt: string
}

interface Database {
  speakers: any[]
  sessions: any[]
  events: any[]
  reviews: any[]
  admins: Admin[]
}

async function readDatabase(): Promise<Database> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Database file not found at: ${dbPath}`)
      console.error('Please run the app first: npm run dev')
    } else {
      console.error('Error reading database:', error.message)
    }
    throw error
  }
}

async function writeDatabase(data: Database): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
}

async function addAdmin(username: string, password: string) {
  console.log(`Adding admin user: ${username}`)
  
  const db = await readDatabase()
  
  // Check if admin already exists
  const existingAdmin = db.admins.find(a => a.username === username)
  if (existingAdmin) {
    console.error(`❌ Admin "${username}" already exists!`)
    process.exit(1)
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)
  
  // Create new admin
  const newAdmin: Admin = {
    id: Date.now().toString(),
    username: username,
    passwordHash: passwordHash,
    createdAt: new Date().toISOString()
  }
  
  db.admins.push(newAdmin)
  await writeDatabase(db)
  
  console.log(`✅ Admin "${username}" added successfully!`)
  console.log(`📝 Total admins: ${db.admins.length}`)
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log('Usage: npx tsx add-admin.ts <username> [password]')
    console.log('Example: npx tsx add-admin.ts john mypassword123')
    console.log('')
    console.log('⚠️  If password contains special characters, wrap it in quotes:')
    console.log('    npx tsx add-admin.ts john "MyPass!123$Secure"')
    console.log('')
    console.log('Or run without password to be prompted securely:')
    console.log('    npx tsx add-admin.ts john')
    process.exit(1)
  }
  
  const [username] = args
  let password = args.slice(1).join(' ')
  
  // If password not provided, prompt for it
  if (!password) {
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    password = await new Promise<string>((resolve) => {
      rl.question('Enter password: ', (answer: string) => {
        rl.close()
        resolve(answer)
      })
    })
  }
  
  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters long')
    process.exit(1)
  }
  
  try {
    await addAdmin(username, password)
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
