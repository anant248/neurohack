"use client"

import { useState, useRef } from "react"
import type { Editor } from "@tiptap/react"

interface RichToolbarProps {
  editor: Editor | null
}

export function RichToolbar({ editor }: RichToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const linkInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  const applyLink = () => {
    const url = linkUrl.trim()
    if (url) {
      editor.chain().focus().setLink({ href: url.startsWith("http") ? url : `https://${url}` }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkUrl("")
  }

  const openLinkInput = () => {
    const existing = editor.getAttributes("link").href as string | undefined
    setLinkUrl(existing ?? "")
    setShowLinkInput(true)
    setTimeout(() => linkInputRef.current?.focus(), 0)
  }

  const btn = (active: boolean) =>
    `rich-toolbar-btn${active ? " rich-toolbar-btn--active" : ""}`

  return (
    <div className="rich-toolbar-wrap">
      <div className="rich-toolbar">
        <button
          type="button"
          className={btn(editor.isActive("bold"))}
          title="Bold (⌘B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          className={btn(editor.isActive("italic"))}
          title="Italic (⌘I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={btn(editor.isActive("underline"))}
          title="Underline (⌘U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span style={{ textDecoration: "underline" }}>U</span>
        </button>

        <button
          type="button"
          className={btn(editor.isActive("strike"))}
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span style={{ textDecoration: "line-through" }}>S</span>
        </button>

        <div className="rich-toolbar-divider" />

        <button
          type="button"
          className={btn(editor.isActive("link"))}
          title="Link (⌘K)"
          onClick={openLinkInput}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="rich-toolbar-divider" />

        {/* Text color */}
        <label className={`rich-toolbar-btn rich-toolbar-color-btn`} title="Text color">
          <span style={{ color: editor.getAttributes("textStyle").color ?? "currentColor", fontWeight: 700 }}>A</span>
          <input
            type="color"
            className="rich-toolbar-color-input"
            defaultValue="#ffffff"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>

        {/* Highlight — click toggles off when active; color picker sets color when not active */}
        <label
          className={`rich-toolbar-btn rich-toolbar-color-btn${editor.isActive("highlight") ? " rich-toolbar-btn--active" : ""}`}
          title="Highlight"
          onClick={e => {
            if (editor.isActive("highlight")) {
              e.preventDefault()
              editor.chain().focus().unsetHighlight().run()
            }
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 15h16L12 3zM4 15v4h16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="color"
            className="rich-toolbar-color-input"
            defaultValue="#f59e0b"
            onChange={e => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
          />
        </label>

        <div className="rich-toolbar-divider" />

        <button
          type="button"
          className="rich-toolbar-btn"
          title="Clear formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M6 12h12M6 8h8M6 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {showLinkInput && (
        <div className="rich-link-row">
          <input
            ref={linkInputRef}
            type="url"
            className="rich-link-input"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { e.preventDefault(); applyLink() }
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl("") }
            }}
          />
          <button type="button" className="rich-link-apply" onClick={applyLink}>Apply</button>
          <button type="button" className="rich-link-cancel" onClick={() => { setShowLinkInput(false); setLinkUrl("") }}>✕</button>
        </div>
      )}
    </div>
  )
}
