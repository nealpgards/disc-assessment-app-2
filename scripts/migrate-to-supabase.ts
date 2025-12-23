/**
 * Migration script to move data from SQLite to Supabase
 * 
 * Usage:
 * 1. Make sure you have your Supabase credentials in .env.local
 * 2. Run: npx tsx scripts/migrate-to-supabase.ts
 */

import Database from 'better-sqlite3'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const dbPath = path.join(process.cwd(), 'data', 'disc-assessment.db')

if (!fs.existsSync(dbPath)) {
  console.error(`❌ SQLite database not found at: ${dbPath}`)
  process.exit(1)
}

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Supabase...\n')

  try {
    // Connect to SQLite
    const db = new Database(dbPath)
    console.log('✅ Connected to SQLite database')

    // Fetch all results from SQLite
    const stmt = db.prepare('SELECT * FROM results ORDER BY id')
    const rows = stmt.all() as any[]
    
    console.log(`📊 Found ${rows.length} records to migrate\n`)

    if (rows.length === 0) {
      console.log('⚠️  No records to migrate. Exiting.')
      db.close()
      return
    }

    // Transform and insert into Supabase
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        const { error } = await supabase.from('results').insert({
          // Note: We're not setting id to let Supabase auto-generate it
          // If you want to preserve IDs, you can use: id: row.id
          name: row.name,
          email: row.email || null,
          department: row.department,
          team_code: row.team_code || null,
          natural_D: row.natural_D,
          natural_I: row.natural_I,
          natural_S: row.natural_S,
          natural_C: row.natural_C,
          adaptive_D: row.adaptive_D,
          adaptive_I: row.adaptive_I,
          adaptive_S: row.adaptive_S,
          adaptive_C: row.adaptive_C,
          primary_natural: row.primary_natural,
          primary_adaptive: row.primary_adaptive,
          driving_forces: row.driving_forces || null,
          created_at: row.created_at || new Date().toISOString(),
        })

        if (error) {
          console.error(`❌ Error migrating row ${row.id}:`, error.message)
          errorCount++
        } else {
          successCount++
          if ((i + 1) % 10 === 0) {
            console.log(`  ✓ Migrated ${i + 1}/${rows.length} records...`)
          }
        }
      } catch (err) {
        console.error(`❌ Error migrating row ${row.id}:`, err)
        errorCount++
      }
    }

    db.close()

    console.log('\n' + '='.repeat(50))
    console.log('📈 Migration Summary:')
    console.log(`  ✅ Successfully migrated: ${successCount} records`)
    if (errorCount > 0) {
      console.log(`  ❌ Failed: ${errorCount} records`)
    }
    console.log('='.repeat(50))

    // Verify migration
    const { count } = await supabase
      .from('results')
      .select('*', { count: 'exact', head: true })

    console.log(`\n🔍 Verification: Supabase now has ${count} total records`)
    
    if (count === rows.length) {
      console.log('✅ Migration completed successfully!')
    } else {
      console.log(`⚠️  Record count mismatch. Expected ${rows.length}, got ${count}`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()

