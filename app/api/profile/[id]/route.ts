import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    const { data: memes } = await supabase
      .from('memes')
      .select('*')
      .eq('user_id', id)
      .eq('is_published', true)

    return NextResponse.json({ profile, memes })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
