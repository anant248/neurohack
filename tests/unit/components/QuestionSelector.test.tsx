import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { QuestionSelector } from "@/components/practice/QuestionSelector"
import { INTERVIEW_QUESTIONS } from "@/lib/constants"

describe("QuestionSelector", () => {
  it("renders the question dropdown", () => {
    render(<QuestionSelector selectedQuestion="" onSelect={vi.fn()} />)
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("displays all interview questions as options", () => {
    render(<QuestionSelector selectedQuestion="" onSelect={vi.fn()} />)
    INTERVIEW_QUESTIONS.forEach(q => {
      expect(screen.getByText(q)).toBeInTheDocument()
    })
  })

  it("calls onSelect when a question is chosen", () => {
    const onSelect = vi.fn()
    render(<QuestionSelector selectedQuestion="" onSelect={onSelect} />)
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: INTERVIEW_QUESTIONS[0] } })
    expect(onSelect).toHaveBeenCalledWith(INTERVIEW_QUESTIONS[0])
  })

  it("shows selected question in preview box", () => {
    const question = INTERVIEW_QUESTIONS[2]
    render(<QuestionSelector selectedQuestion={question} onSelect={vi.fn()} />)
    // The preview <p> has a ❝ prefix, so match by contained text
    expect(screen.getByText(new RegExp(question), { selector: "p" })).toBeInTheDocument()
  })

  it("does not show preview box when no question is selected", () => {
    render(<QuestionSelector selectedQuestion="" onSelect={vi.fn()} />)
    expect(screen.queryByRole("blockquote")).not.toBeInTheDocument()
  })

  it("calls onSelect with a valid question when Random is clicked", () => {
    const onSelect = vi.fn()
    render(<QuestionSelector selectedQuestion="" onSelect={onSelect} />)
    const randomBtn = screen.getByText(/Random/i)
    fireEvent.click(randomBtn)
    expect(onSelect).toHaveBeenCalledTimes(1)
    const called = onSelect.mock.calls[0][0] as string
    expect(INTERVIEW_QUESTIONS).toContain(called)
  })
})
