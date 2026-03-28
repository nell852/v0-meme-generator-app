'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Canvas, Image as FabricImage, Text as FabricText, Rect, Circle } from 'fabric'

interface CanvasEditorRef {
  addText: (text: string) => void
  addShape: (type: string) => void
  deleteSelected: () => void
  changeTextColor: (color: string) => void
  changeFontSize: (size: number) => void
  getElement: () => HTMLCanvasElement | null
}

interface CanvasEditorProps {
  imageUrl: string
}

export const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(
  ({ imageUrl }, ref) => {
    const canvasRef = useRef<Canvas | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const elementRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
      if (!containerRef.current || !imageUrl) return

      const initCanvas = async () => {
        // Clear previous canvas
        if (canvasRef.current) {
          canvasRef.current.dispose()
        }

        // Create new canvas
        elementRef.current = document.createElement('canvas')
        elementRef.current.id = 'meme-canvas'
        containerRef.current!.innerHTML = ''
        containerRef.current!.appendChild(elementRef.current)

        canvasRef.current = new Canvas(elementRef.current, {
          width: 600,
          height: 600,
          backgroundColor: '#ffffff',
        })

        // Load and add image
        try {
          const img = await FabricImage.fromURL(imageUrl, {
            crossOrigin: 'anonymous',
          })

          // Scale image to fit canvas
          const scale = Math.min(600 / img.width!, 600 / img.height!)
          img.scale(scale)
          img.set({
            left: 300 - (img.width! * scale) / 2,
            top: 300 - (img.height! * scale) / 2,
          })

          canvasRef.current.add(img)
          canvasRef.current.setObjectCoords()
        } catch (error) {
          console.error('Error loading image:', error)
        }
      }

      initCanvas()

      return () => {
        if (canvasRef.current) {
          canvasRef.current.dispose()
        }
      }
    }, [imageUrl])

    useImperativeHandle(ref, () => ({
      addText: (text: string) => {
        if (!canvasRef.current) return
        const fabricText = new FabricText(text || 'Add text', {
          left: 100,
          top: 100,
          fontSize: 40,
          fill: '#ffffff',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 2,
          fontWeight: 'bold',
        })
        canvasRef.current.add(fabricText)
        canvasRef.current.setActiveObject(fabricText)
        canvasRef.current.renderAll()
      },
      addShape: (type: string) => {
        if (!canvasRef.current) return
        let shape

        if (type === 'rectangle') {
          shape = new Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 100,
            fill: 'rgba(255, 0, 110, 0.5)',
            stroke: '#FF006E',
            strokeWidth: 2,
          })
        } else if (type === 'circle') {
          shape = new Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: 'rgba(0, 217, 255, 0.5)',
            stroke: '#00D9FF',
            strokeWidth: 2,
          })
        }

        if (shape) {
          canvasRef.current.add(shape)
          canvasRef.current.setActiveObject(shape)
          canvasRef.current.renderAll()
        }
      },
      deleteSelected: () => {
        if (!canvasRef.current) return
        const activeObject = canvasRef.current.getActiveObject()
        if (activeObject) {
          canvasRef.current.remove(activeObject)
          canvasRef.current.renderAll()
        }
      },
      changeTextColor: (color: string) => {
        if (!canvasRef.current) return
        const activeObject = canvasRef.current.getActiveObject()
        if (activeObject && activeObject.type === 'text') {
          activeObject.set({ fill: color })
          canvasRef.current.renderAll()
        }
      },
      changeFontSize: (size: number) => {
        if (!canvasRef.current) return
        const activeObject = canvasRef.current.getActiveObject()
        if (activeObject && activeObject.type === 'text') {
          activeObject.set({ fontSize: size })
          canvasRef.current.renderAll()
        }
      },
      getElement: () => elementRef.current,
    }))

    return (
      <div
        ref={containerRef}
        className="rounded-lg border border-border bg-card overflow-auto flex items-center justify-center"
        style={{ minHeight: '600px' }}
      />
    )
  }
)

CanvasEditor.displayName = 'CanvasEditor'
