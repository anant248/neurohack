"use client"

interface CompanyCardProps {
  companyName: string
  role: string
  companyBlurb: string
  companyLink: string
  onReset: () => void
}

export function CompanyCard({ companyName, role, companyBlurb, companyLink, onReset }: CompanyCardProps) {
  return (
    <div className="company-card">
      <div className="company-card-header">
        <div className="company-info">
          <h2 className="company-name">{companyName}</h2>
          <span className="company-role">{role}</span>
        </div>
        <button type="button" className="company-reset-btn" onClick={onReset} title="Start new session">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              fill="currentColor"
            />
          </svg>
          New session
        </button>
      </div>

      <p className="company-blurb">{companyBlurb}</p>

      <a
        href={companyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="company-link"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Learn more about {companyName}
      </a>
    </div>
  )
}
