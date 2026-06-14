"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import { useState } from "react"
import type { CoffeeChatQuestion } from "@/lib/types"
import { RichToolbar } from "./RichToolbar"

interface QuestionEditorProps {
  question: CoffeeChatQuestion
  onChange: (q: CoffeeChatQuestion) => void
  onDelete: () => void
}

export function QuestionEditor({ question, onChange, onDelete }: QuestionEditorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: question.notes || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange({ ...question, notes: editor.getHTML() })
    },
  })

  return (
    <div className={`question-row${isOpen ? " question-row--open" : ""}`}>
      <div className="question-row-header">
        <button
          type="button"
          className="question-toggle-btn"
          onClick={() => setIsOpen(o => !o)}
          aria-expanded={isOpen}
        >
          <svg
            className={`question-chevron${isOpen ? " question-chevron--open" : ""}`}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
          >
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="question-text">{question.text}</span>
        </button>

        <button
          type="button"
          className="question-delete-btn"
          title="Remove question"
          onClick={onDelete}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="question-notes-area">
          <RichToolbar editor={editor} />
          <div className="rich-editor">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}
    </div>
  )
}
