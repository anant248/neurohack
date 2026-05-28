import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { QuestionSelector } from "@/components/practice/QuestionSelector"
import type { TailoredQuestion } from "@/lib/types"

const MOCK_QUESTIONS: TailoredQuestion[] = [
  { text: "Tell me about yourself.", category: "General", starHint: "Cover your background (S), your role (T), key actions (A), and impact (R)." },
  { text: "Describe a challenge you overcame.", category: "Growth", starHint: "Set the scene (S), explain your responsibility (T), detail your steps (A), and the outcome (R)." },
  { text: "Tell me about a time you led a team.", category: "Leadership", starHint: "Describe the team and goal (S/T), how you guided them (A), and the result (R)." },
]

describe("QuestionSelector", () => {
  it("renders the question dropdown", () => {
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion="" onSelect={vi.fn()} />)
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("displays all questions as options", () => {
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion="" onSelect={vi.fn()} />)
    MOCK_QUESTIONS.forEach(q => {
      expect(screen.getByText(q.text)).toBeInTheDocument()
    })
  })

  it("calls onSelect when a question is chosen", () => {
    const onSelect = vi.fn()
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion="" onSelect={onSelect} />)
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: MOCK_QUESTIONS[0].text } })
    expect(onSelect).toHaveBeenCalledWith(MOCK_QUESTIONS[0].text)
  })

  it("shows selected question text and STAR hint when a question is selected", () => {
    const question = MOCK_QUESTIONS[1]
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion={question.text} onSelect={vi.fn()} />)
    // The selected-question-text paragraph shows the question with a ❝ prefix
    expect(screen.getByText(new RegExp(question.text), { selector: "p.selected-question-text" })).toBeInTheDocument()
    expect(screen.getByText(question.starHint)).toBeInTheDocument()
  })

  it("does not show STAR hint when no question is selected", () => {
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion="" onSelect={vi.fn()} />)
    expect(screen.queryByText(/Cover your background/)).not.toBeInTheDocument()
  })

  it("shows category badge for selected question", () => {
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion={MOCK_QUESTIONS[2].text} onSelect={vi.fn()} />)
    // The badge span is inside .question-category-badge
    expect(screen.getByText("Leadership", { selector: "span.question-category-badge" })).toBeInTheDocument()
  })

  it("shows category filter chips when there are multiple categories", () => {
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion="" onSelect={vi.fn()} />)
    expect(screen.getByText("All")).toBeInTheDocument()
    expect(screen.getByText("Growth")).toBeInTheDocument()
    expect(screen.getByText("Leadership")).toBeInTheDocument()
  })

  it("filters questions by category", () => {
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion="" onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText("Leadership"))
    // Leadership questions visible, Growth questions not in select options
    expect(screen.getByText("Tell me about a time you led a team.")).toBeInTheDocument()
    expect(screen.queryByText("Describe a challenge you overcame.")).not.toBeInTheDocument()
  })

  it("calls onSelect with a valid question when Random is clicked", () => {
    const onSelect = vi.fn()
    render(<QuestionSelector questions={MOCK_QUESTIONS} selectedQuestion="" onSelect={onSelect} />)
    const randomBtn = screen.getByText(/Random/i)
    fireEvent.click(randomBtn)
    expect(onSelect).toHaveBeenCalledTimes(1)
    const called = onSelect.mock.calls[0][0] as string
    expect(MOCK_QUESTIONS.map(q => q.text)).toContain(called)
  })
})
