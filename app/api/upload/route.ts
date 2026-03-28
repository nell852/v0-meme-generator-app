import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function ensureBucket(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some((b) => b.name === 'memes')
    if (!exists) {
      await supabase.storage.createBucket('memes', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      })
    }
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - please log in again' }, { status: 401 })
    }

    // Auto-create user profile if missing (needed for memes FK)
    await supabase
      .from('users')
      .upsert(
        { id: user.id, username: user.email?.split('@')[0] || user.id },
        { onConflict: 'id', ignoreDuplicates: true }
      )

    // Try to ensure bucket exists (may require service role in some setups)
    const bucketOk = await ensureBucket(supabase)

    if (bucketOk) {
      const ext = file.name.split('.').pop() || 'png'
      const fileName = `${user.id}/${Date.now()}.${ext}`
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { data, error } = await supabase.storage
        .from('memes')
        .upload(fileName, buffer, {
          contentType: file.type || 'image/png',
          upsert: false,
        })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('memes')
          .getPublicUrl(data.path)
        return NextResponse.json({ url: publicUrlData.publicUrl })
      }

      console.error('Storage upload failed, falling back to base64')
    }

    // Fallback: convert to base64 data URL stored in the database
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = file.type || 'image/png'
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error('Upload error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 })
  }
}
