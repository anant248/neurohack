"use client"

import { useState } from "react"
import Link from "next/link"
import { useCoffeeChats } from "@/hooks/useCoffeeChats"
import { emptyCoffeeChat } from "@/lib/coffeeChats"
import { AuthButton } from "@/components/auth/AuthButton"
import { PrepModeDropdown } from "@/components/nav/PrepModeDropdown"
import { ChatEditor } from "@/components/coffee-chats/ChatEditor"
import type { CoffeeChat } from "@/lib/types"
import "./styles.css"

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return dateStr
  }
}

export default function CoffeeChatsPage() {
  const { chats, addChat, updateChat, deleteChat } = useCoffeeChats()
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const activeChat = chats.find(c => c.id === activeChatId) ?? null

  const handleNewChat = () => {
    const chat = addChat(emptyCoffeeChat())
    setActiveChatId(chat.id)
  }

  const handleChange = (updated: CoffeeChat) => {
    updateChat(updated.id, {
      personName: updated.personName,
      company: updated.company,
      role: updated.role,
      date: updated.date,
      format: updated.format,
      questions: updated.questions,
      todos: updated.todos,
      aiGenerationsUsed: updated.aiGenerationsUsed,
    })
  }

  const handleDelete = (id: string) => {
    deleteChat(id)
    setActiveChatId(null)
  }

  return (
    <div className="chat-layout">
      {/* ── Top bar ── */}
      <header className="chat-topbar">
        <div className="topbar-inner">
          <Link href="/" className="topbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                fill="currentColor"
              />
            </svg>
            <span>Interprep</span>
          </Link>
          <div className="topbar-nav">
            <PrepModeDropdown />
          </div>
          <div className="topbar-actions">
            <AuthButton />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="chat-body">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span className="chat-sidebar-title">Coffee Chats</span>
            <button type="button" className="new-chat-btn" onClick={handleNewChat}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              New
            </button>
          </div>

          <div className="chat-list">
            {chats.length === 0 ? (
              <div className="chat-list-empty">
                <p className="chat-list-empty-title">No chats yet</p>
                <p className="chat-list-empty-sub">Click &ldquo;New&rdquo; to log your first coffee chat.</p>
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-list-item${chat.id === activeChatId ? " chat-list-item--active" : ""}`}
                  onClick={() => setActiveChatId(chat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setActiveChatId(chat.id) }}
                >
                  <span className="chat-list-name">
                    {chat.personName || "Untitled chat"}
                  </span>
                  <span className="chat-list-meta">
                    {[chat.company, formatDate(chat.date)].filter(Boolean).join(" · ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Editor area */}
        <main className="chat-editor-area">
          {activeChat ? (
            <ChatEditor
              key={activeChat.id}
              chat={activeChat}
              allChats={chats}
              onChange={handleChange}
              onDelete={() => handleDelete(activeChat.id)}
            />
          ) : (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v3M10 2v3M14 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="chat-empty-title">Select or create a coffee chat</p>
              <p className="chat-empty-sub">
                {chats.length === 0
                  ? 'Click "New" in the sidebar to log your first networking conversation.'
                  : "Pick a chat from the sidebar to open it."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
