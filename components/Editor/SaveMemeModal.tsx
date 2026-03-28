'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface SaveMemeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onSave: () => Promise<void>
  isSaving: boolean
}

export function SaveMemeModal({
  open,
  onOpenChange,
  title,
  onSave,
  isSaving,
}: SaveMemeModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Meme</AlertDialogTitle>
          <AlertDialogDescription>
            Ready to share your meme "{title}" with the community? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save & Share'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
