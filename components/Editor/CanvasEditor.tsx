'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { fabric } from 'fabric'

interface CanvasEditorRef {
  addText: (text: string) => void
  addShape: (type: string) => void
  deleteSelected: () => void
  changeTextColor: (color: string) => void
  changeFontSize: (size: number) => void
  getElement: () => HTMLCanvasElement | null
  toBlob: () => Promise<Blob | null>
  toDataURL: () => string | null
}

interface CanvasEditorProps {
  imageUrl: string
}

export const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(
  ({ imageUrl }, ref) => {
    const canvasRef = useRef<fabric.Canvas | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const elementRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
      if (!containerRef.current || !imageUrl) return

      const initCanvas = async () => {
        if (canvasRef.current) {
          canvasRef.current.dispose()
          canvasRef.current = null
        }

        elementRef.current = document.createElement('canvas')
        elementRef.current.id = 'meme-canvas'
        containerRef.current!.innerHTML = ''
        containerRef.current!.appendChild(elementRef.current)

        const canvas = new fabric.Canvas(elementRef.current, {
          width: 600,
          height: 600,
          backgroundColor: '#ffffff',
        })
        canvasRef.current = canvas

        fabric.Image.fromURL(
          imageUrl,
          (img) => {
            if (!canvasRef.current) return
            const scale = Math.min(600 / (img.width || 600), 600 / (img.height || 600))
            img.scale(scale)
            img.set({
              left: 300 - ((img.width || 0) * scale) / 2,
              top: 300 - ((img.height || 0) * scale) / 2,
              selectable: true,
            })
            canvasRef.current.add(img)
            canvasRef.current.renderAll()
          },
          { crossOrigin: 'anonymous' }
        )
      }

      initCanvas()

      return () => {
        if (canvasRef.current) {
          canvasRef.current.dispose()
          canvasRef.current = null
        }
      }
    }, [imageUrl])

    useImperativeHandle(ref, () => ({
      addText: (text: string) => {
        if (!canvasRef.current) return
        const fabricText = new fabric.Text(text || 'Add text', {
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
        let shape: fabric.Object | undefined

        if (type === 'rectangle') {
          shape = new fabric.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 100,
            fill: 'rgba(255, 0, 110, 0.5)',
            stroke: '#FF006E',
            strokeWidth: 2,
          })
        } else if (type === 'circle') {
          shape = new fabric.Circle({
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
          (activeObject as fabric.Text).set({ fontSize: size })
          canvasRef.current.renderAll()
        }
      },
      getElement: () => elementRef.current,
      toDataURL: () => {
        if (!canvasRef.current) return null
        return canvasRef.current.toDataURL({ format: 'png', multiplier: 1 })
      },
      toBlob: () => {
        return new Promise((resolve) => {
          if (!canvasRef.current) {
            resolve(null)
            return
          }
          const dataUrl = canvasRef.current.toDataURL({ format: 'png', multiplier: 1 })
          fetch(dataUrl)
            .then((res) => res.blob())
            .then(resolve)
            .catch(() => resolve(null))
        })
      },
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
