'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Type,
  Square,
  Circle,
  Trash2,
  Plus,
} from 'lucide-react'

interface ToolBarProps {
  canvasRef: React.RefObject<any>
}

export function ToolBar({ canvasRef }: ToolBarProps) {
  const [textInput, setTextInput] = useState('')
  const [fontSize, setFontSize] = useState(40)
  const [textColor, setTextColor] = useState('#ffffff')

  const addText = () => {
    if (!canvasRef.current) return
    canvasRef.current.addText(textInput || 'Add text')
    setTextInput('')
  }

  const addRectangle = () => {
    if (!canvasRef.current) return
    canvasRef.current.addShape('rectangle')
  }

  const addCircle = () => {
    if (!canvasRef.current) return
    canvasRef.current.addShape('circle')
  }

  const deleteSelected = () => {
    if (!canvasRef.current) return
    canvasRef.current.deleteSelected()
  }

  const changeFontSize = (size: number) => {
    setFontSize(size)
    if (!canvasRef.current) return
    canvasRef.current.changeFontSize(size)
  }

  const changeTextColor = (color: string) => {
    setTextColor(color)
    if (!canvasRef.current) return
    canvasRef.current.changeTextColor(color)
  }

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold">Tools</h3>

      {/* Text Tool */}
      <FieldGroup>
        <FieldLabel className="text-sm">Add Text</FieldLabel>
        <div className="space-y-2">
          <Input
            placeholder="Enter text..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addText()}
          />
          <Button onClick={addText} size="sm" className="w-full gap-2">
            <Type className="h-4 w-4" />
            Add Text
          </Button>
        </div>
      </FieldGroup>

      {/* Font Size */}
      <FieldGroup>
        <FieldLabel className="text-sm">Font Size</FieldLabel>
        <Input
          type="number"
          min="10"
          max="100"
          value={fontSize}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            if (!isNaN(val) && val >= 10 && val <= 200) changeFontSize(val)
          }}
        />
      </FieldGroup>

      {/* Text Color */}
      <FieldGroup>
        <FieldLabel className="text-sm">Text Color</FieldLabel>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => changeTextColor(e.target.value)}
            className="h-10 w-20"
          />
          <span className="text-sm text-muted-foreground">{textColor}</span>
        </div>
      </FieldGroup>

      {/* Shapes */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Shapes</h4>
        <div className="space-y-2">
          <Button onClick={addRectangle} size="sm" variant="outline" className="w-full gap-2">
            <Square className="h-4 w-4" />
            Rectangle
          </Button>
          <Button onClick={addCircle} size="sm" variant="outline" className="w-full gap-2">
            <Circle className="h-4 w-4" />
            Circle
          </Button>
        </div>
      </div>

      {/* Delete */}
      <Button onClick={deleteSelected} size="sm" variant="destructive" className="w-full gap-2">
        <Trash2 className="h-4 w-4" />
        Delete Selected
      </Button>
    </div>
  )
}
