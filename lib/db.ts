import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(process.cwd(), 'data', 'disc-assessment.db')

// Ensure data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize database connection
let db: InstanceType<typeof Database>
try {
  db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Initialize schema
  function initializeSchema() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        department TEXT NOT NULL,
        team_code TEXT,
        natural_D INTEGER NOT NULL,
        natural_I INTEGER NOT NULL,
        natural_S INTEGER NOT NULL,
        natural_C INTEGER NOT NULL,
        adaptive_D INTEGER NOT NULL,
        adaptive_I INTEGER NOT NULL,
        adaptive_S INTEGER NOT NULL,
        adaptive_C INTEGER NOT NULL,
        primary_natural TEXT NOT NULL,
        primary_adaptive TEXT NOT NULL,
        driving_forces TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_department ON results(department);
      CREATE INDEX IF NOT EXISTS idx_team_code ON results(team_code);
      CREATE INDEX IF NOT EXISTS idx_created_at ON results(created_at);
    `)
    
    // Add team_code column if it doesn't exist (for existing databases)
    try {
      db.exec(`ALTER TABLE results ADD COLUMN team_code TEXT;`)
    } catch (error) {
      // Column already exists, ignore error
    }
  }

  // Initialize on first load
  initializeSchema()
  console.log('Database initialized successfully at:', dbPath)
} catch (error) {
  console.error('Failed to initialize database:', error)
  throw error
}

export interface ResultRow {
  id: number
  name: string
  email: string | null
  department: string
  team_code: string | null
  natural_D: number
  natural_I: number
  natural_S: number
  natural_C: number
  adaptive_D: number
  adaptive_I: number
  adaptive_S: number
  adaptive_C: number
  primary_natural: string
  primary_adaptive: string
  driving_forces: string | null
  created_at: string
}

export const dbInstance = db

