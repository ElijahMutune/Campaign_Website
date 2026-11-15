
import {
  ArrowUpRight,
  Users,
  CalendarDays,
  Newspaper,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

import { useAdminOverview } from '../../hooks/useAdminOverview'

function displayCount(value) {
  return typeof value === 'number' && Number.isFinite(value)
      ? value
      : '—'
}

function AdminDashboard() {
  const {
    stats,
    errors,
    isLoading,
    refresh,
  } = useAdminOverview()

  const dashboardStats = stats ?? {}

  const editorCount = displayCount(dashboardStats.editors)
  const newsCount = displayCount(dashboardStats.news)
  const publishedNewsCount = displayCount(dashboardStats.publishedNews)
  const eventCount = displayCount(dashboardStats.events)
  const resourceCount = displayCount(dashboardStats.resources)

  const hasErrors = Array.isArray(errors) && errors.length > 0

  const overviewCards = [
    {
      label: 'Editor accounts',
      value: editorCount,
      detail: 'Campaign content team',
      icon: Users,
    },
    {
      label: 'News articles',
      value: newsCount,
      detail: `${publishedNewsCount} published`,
      icon: Newspaper,
    },
    {
      label: 'Campaign events',
      value: eventCount,
      detail: 'Campaign event records',
      icon: CalendarDays,
    },
    {
      label: 'Managed resources',
      value: resourceCount,
      detail: 'Documents and posters',
      icon: FileText,
    },
  ]

  const totalRecords = [
    dashboardStats.news,
    dashboardStats.events,
    dashboardStats.resources,
  ]

  const hasCompleteTotals = totalRecords.every(
      (value) => typeof value === 'number' && Number.isFinite(value)
  )

  const contentTotal = hasCompleteTotals
      ? totalRecords.reduce((total, value) => total + value, 0)
      : null

  const handleRefresh = () => {
    if (!isLoading) {
      refresh()
    }
  }

  return (
      <main className="dashboard-page">
        <header className="dashboard-heading">
          <div>
                    <span className="eyebrow">
                        ADMINISTRATION
                    </span>

            <h1>Workspace overview</h1>

            <p>
              Monitor campaign content, team accounts,
              events and published resources.
            </p>
          </div>

          <button
              type="button"
              className="dashboard-refresh"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh dashboard data"
          >
            <RefreshCw
                size={15}
                className={isLoading ? 'refresh-spinning' : ''}
            />

            {isLoading ? 'Loading...' : 'Refresh data'}
          </button>
        </header>

        {hasErrors && (
            <div
                className="dashboard-api-error"
                role="alert"
            >
              <div className="dashboard-error-heading">
                <AlertCircle size={18} />

                <strong>
                  Some dashboard information could not be loaded.
                </strong>
              </div>

              {errors.map((error, index) => (
                  <p key={`${index}-${error}`}>
                    {error}
                  </p>
              ))}

              <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoading}
              >
                Try again
              </button>
            </div>
        )}

        <section
            className="overview-grid"
            aria-label="Campaign statistics"
        >
          {overviewCards.map((card) => {
            const Icon = card.icon

            return (
                <article
                    className="overview-card"
                    key={card.label}
                >
                  <div className="overview-card-top">
                    <span>{card.label}</span>

                    <Icon size={20} />
                  </div>

                  <strong>
                    {isLoading ? '...' : card.value}
                  </strong>

                  <small>
                    {card.detail}
                  </small>
                </article>
            )
          })}
        </section>

        <section className="dashboard-lower-grid">
          <article className="dashboard-panel">
            <div className="panel-heading">
              <div>
                            <span className="eyebrow">
                                CONTENT MANAGEMENT
                            </span>

                <h2>Campaign workspace</h2>
              </div>

              <ArrowUpRight size={20} />
            </div>

            <p>
              Manage candidate information, campaign priorities,
              news articles, events, documents, posters,
              website navigation and settings.
            </p>

            <div className="panel-note">
              <span className="status-dot" />

              {isLoading
                  ? 'Retrieving information from the backend...'
                  : hasErrors
                      ? 'Some backend information is unavailable.'
                      : contentTotal === null
                          ? 'Dashboard information loaded.'
                          : `${contentTotal} content and resource records retrieved from the backend.`}
            </div>
          </article>

          <article className="dashboard-panel">
            <div className="panel-heading">
              <div>
                            <span className="eyebrow">
                                SYSTEM CONNECTION
                            </span>

                <h2>Backend status</h2>
              </div>

              {isLoading ? (
                  <RefreshCw
                      size={20}
                      className="refresh-spinning"
                  />
              ) : hasErrors ? (
                  <AlertCircle
                      size={20}
                      aria-label="Some requests failed"
                  />
              ) : (
                  <CheckCircle2
                      size={20}
                      aria-label="Dashboard requests completed"
                  />
              )}
            </div>

            <p>
              Dashboard statistics are retrieved through
              the campaign backend APIs.
            </p>

            <div className="panel-note">
              <span className="status-dot" />

              {isLoading
                  ? 'Loading backend information'
                  : hasErrors
                      ? 'Some API requests need attention'
                      : 'Dashboard requests completed'}
            </div>
          </article>
        </section>
      </main>
  )
}

export default AdminDashboard
