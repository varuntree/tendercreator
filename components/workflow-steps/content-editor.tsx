'use client'

import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent,useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash/debounce'
import { useEffect, useMemo,useState } from 'react'
import { toast } from 'sonner'

import { EditorToolbar } from './editor-toolbar'

interface ContentEditorProps {
  workPackageId: string
  initialContent: string
  onContentChange?: (content: string) => void
}

export function ContentEditor({ workPackageId, initialContent, onContentChange }: ContentEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Your generated content will appear here...',
      }),
      CharacterCount,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onContentChange?.(html)
      debouncedSave(html)
    },
  })

  const debouncedSave = useMemo(
    () =>
      debounce(async (content: string) => {
        setSaveStatus('saving')
        try {
          const res = await fetch(`/api/work-packages/${workPackageId}/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
          if (res.ok) {
            setSaveStatus('saved')
          } else {
            setSaveStatus('error')
            toast.error('Failed to save changes')
          }
        } catch {
          setSaveStatus('error')
          toast.error('Failed to save changes')
        }
      }, 500),
    [workPackageId]
  )

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  if (!editor) {
    return null
  }

  const wordCount = editor.storage.characterCount.words()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <EditorToolbar editor={editor} />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{wordCount} words</span>
          {saveStatus === 'saving' && <span>Saving...</span>}
          {saveStatus === 'saved' && <span className="text-green-600 dark:text-green-400">Saved</span>}
          {saveStatus === 'error' && <span className="text-red-600 dark:text-red-400">Error</span>}
        </div>
      </div>
      <div className="border rounded-lg bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
