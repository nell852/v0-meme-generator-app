'use client'

import dynamic from 'next/dynamic'

const MemeEditor = dynamic(
  () => import('@/components/MemeEditor').then((m) => m.MemeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    ),
  }
)

export default function EditorPage() {
  return <MemeEditor />
}
