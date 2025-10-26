import { NextResponse } from 'next/server'
import { db } from '@/db/client'

export async function GET() {
  try {
    // Test database connection
    const result = await db.execute('SELECT 1 as test')
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully',
      result: result.rows[0]
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
