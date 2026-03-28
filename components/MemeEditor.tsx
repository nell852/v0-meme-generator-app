'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CanvasEditor } from './Editor/CanvasEditor'
import { ToolBar } from './Editor/ToolBar'
import { SaveMemeModal } from './Editor/SaveMemeModal'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export function MemeEditor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<any>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExportAndSave = async () => {
    if (!canvasRef.current || !title) {
      toast.error('Please enter a title and ensure the editor is loaded')
      return
    }

    try {
      setIsSaving(true)

      // Get canvas data as PNG
      const canvas = canvasRef.current.getElement()
      canvas.toBlob(async (blob: Blob) => {
        try {
          // Upload to Vercel Blob
          const formData = new FormData()
          formData.append('file', blob)

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error('Upload failed')
          }

          const { url } = await uploadResponse.json()

          // Save to Supabase
          const supabase = createClient()
          const { error } = await supabase.from('memes').insert([
            {
              title,
              image_url: url,
              is_published: true,
              user_id: user?.id,
            },
          ])

          if (error) throw error

          toast.success('Meme created successfully!')
          setShowSaveModal(false)
          setTitle('')
          setImageUrl(null)
          router.push('/gallery')
        } catch (error) {
          console.error('Error saving meme:', error)
          toast.error('Failed to save meme')
        } finally {
          setIsSaving(false)
        }
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong')
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Meme Editor</h1>

        {!imageUrl ? (
          <div className="rounded-lg border-2 border-dashed border-primary/30 p-12 text-center">
            <p className="text-lg mb-4">Start by uploading an image</p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mx-auto"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Canvas */}
            <div className="lg:col-span-3">
              <CanvasEditor ref={canvasRef} imageUrl={imageUrl} />
              <Button
                variant="outline"
                onClick={() => setImageUrl(null)}
                className="mt-4 w-full"
              >
                Change Image
              </Button>
            </div>

            {/* Toolbar */}
            <div>
              <ToolBar canvasRef={canvasRef} />
              <div className="mt-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meme Title</label>
                  <Input
                    placeholder="Give your meme a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full"
                  disabled={!title || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save & Share'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SaveMemeModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        title={title}
        onSave={handleExportAndSave}
        isSaving={isSaving}
      />
    </div>
  )
}
