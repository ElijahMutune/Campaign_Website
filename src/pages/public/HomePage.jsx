import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'

import { usePublicContent } from '../../hooks/usePublicContent'
import { publicApi } from '../../services/api'
import ImageSlider from '../../components/public/ImageSlider'

import './PublicHomePage.css'

function formatDate(value) {
  if (!value) return ''

  const date = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? `${value}T00:00:00`
          : value,
  )

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatTime(value) {
  return value ? value.slice(0, 5) : ''
}

function getExcerpt(value, limit = 190) {
  if (!value) return ''

  const plainText = String(value)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  if (plainText.length <= limit) return plainText

  return `${plainText.slice(0, limit).trim()}...`
}

function MediaVisual({ mediaId, alt = '', variant = 'card' }) {
  const [failedMediaId, setFailedMediaId] = useState(null)
  const [imageInfo, setImageInfo] = useState({ mediaId: null, shape: 'landscape' })

  if (!mediaId || failedMediaId === mediaId) {
    return (
        <div className="editorial-image-placeholder">
          <span>CAMPAIGN MEDIA</span>
          <p>Photograph not available</p>
        </div>
    )
  }

  const imageUrl = publicApi.getPublicMediaFileUrl(mediaId)
  const imageShape = imageInfo.mediaId === mediaId
      ? imageInfo.shape
      : 'landscape'
  const isPortrait = imageShape === 'portrait'

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget

    if (!naturalWidth || !naturalHeight) return

    // Portrait and near-square posters should remain fully visible.
    const shape = naturalHeight >= naturalWidth * 0.92
        ? 'portrait'
        : 'landscape'

    setImageInfo({ mediaId, shape })
  }

  return (
      <div
          className={`editorial-media-visual editorial-media-visual--${variant} ${
            isPortrait ? 'is-portrait' : 'is-landscape'
          }`}
      >
        {isPortrait && (
            <img
                className="editorial-image-backdrop"
                src={imageUrl}
                alt=""
                aria-hidden="true"
                loading="lazy"
            />
        )}

        <img
            className="editorial-image"
            src={imageUrl}
            alt={alt}
            loading={variant === 'hero' ? 'eager' : 'lazy'}
            onLoad={handleImageLoad}
            onError={() => setFailedMediaId(mediaId)}
        />
      </div>
  )
}

function StorySlide({
                      item,
                      category,
                      description,
                      date,
                      mediaId,
                      linkUrl,
                    }) {
  const isExternal = /^https?:\/\//i.test(linkUrl || '')

  return (
      <article className="editorial-story-slide">
        <div className="editorial-story-image">
          <MediaVisual
              mediaId={mediaId}
              alt={item.title || category}
              variant="card"
          />
        </div>

        <div className="editorial-story-copy">
          <div className="editorial-story-kicker">
            <span className="editorial-category">{category}</span>
          </div>

          <h3>{item.title}</h3>

          {description && (
              <p>{description}</p>
          )}

          <div className="editorial-story-meta">
            {date && (
                <span className="editorial-story-date">{formatDate(date)}</span>
            )}

            {linkUrl && (
                <a
                    href={linkUrl}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  Read story <ArrowUpRight size={14} />
                </a>
            )}
          </div>
        </div>
      </article>
  )
}

function EditorialSection({
                            id,
                            number,
                            eyebrow,
                            title,
                            description,
                            items,
                            renderSlide,
                            emptyMessage,
                          }) {
  return (
      <motion.section
          className="editorial-section"
          id={id}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.55 }}
      >
        <div className="editorial-section-heading">
          <div>
                    <span className="editorial-eyebrow">
                        <span>{number}</span>
                      {eyebrow}
                    </span>

            <h2>{title}</h2>

            {description && (
                <p>{description}</p>
            )}
          </div>

          <span className="editorial-section-number">
                    {number}
                </span>
        </div>

        {Array.isArray(items) && items.length > 0 ? (
            <div className="editorial-card-grid" role="list" aria-label={title}>
              {items.map((item, index) => (
                  <div
                      className="editorial-card-grid-item"
                      key={item.id ?? `${id}-${index}`}
                      role="listitem"
                  >
                    {renderSlide ? renderSlide(item, index) : null}
                  </div>
              ))}
            </div>
        ) : (
            <div className="editorial-empty-state" role="status">
              {emptyMessage}
            </div>
        )}
      </motion.section>
  )
}

function HomePage() {
  const {
    candidate,
    headlines,
    manifesto,
    news,
    events,
    schedule,
    posters,
    errors,
    isLoading,
    refresh,
  } = usePublicContent()

  const heroSlides = [
    ...(candidate?.profile_media_id
        ? [{
          id: `candidate-${candidate.id}`,
          mediaId: candidate.profile_media_id,
          title: candidate.full_name,
          description: candidate.slogan || candidate.position || '',
          category: 'CANDIDATE PROFILE',
        }]
        : []),

    ...posters
        .filter((poster) => poster.preview_media_id)
        .map((poster) => ({
          id: `poster-${poster.id}`,
          mediaId: poster.preview_media_id,
          title: poster.title,
          description: poster.description || '',
          category: 'CAMPAIGN POSTER',
        })),
  ]

  const hasErrors = Object.keys(errors).length > 0

  return (
      <main className="editorial-home">

        {/* API ERROR NOTICE */}

        {hasErrors && (
            <div className="editorial-api-notice" role="status">
                    <span>
                        Some published information could not be loaded.
                    </span>

              <button
                  type="button"
                  onClick={refresh}
                  disabled={isLoading}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
        )}

        {/* HERO */}

        <section className="editorial-hero">
          <div className="editorial-container">
            <div className="editorial-hero-grid">

              <motion.div
                  className="editorial-hero-copy"
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.65 }}
              >
                            <span className="editorial-eyebrow">
                                MATUNGULU
                                <span className="editorial-eyebrow-dot">●</span>
                                CAMPAIGN
                            </span>

                <h1>
                  {candidate?.slogan || (
                      <>
                        A shared vision.
                        <br />
                        <span>A stronger Matungulu.</span>
                      </>
                  )}
                </h1>

                <p className="editorial-hero-description">
                  {candidate?.biography ||
                      'Explore published campaign information, public priorities, news and community activities.'}
                </p>

                {candidate && (
                    <div className="editorial-candidate-details">
                      <strong>{candidate.full_name}</strong>

                      {candidate.position && (
                          <span>{candidate.position}</span>
                      )}

                      {candidate.constituency && (
                          <span>{candidate.constituency}</span>
                      )}
                    </div>
                )}

                <div className="editorial-hero-actions">
                  <a
                      href="#top-stories"
                      className="editorial-primary-button"
                  >
                    Explore top stories
                    <ArrowDownRight size={18} />
                  </a>

                  <a href="#campaign-priorities">
                    Campaign priorities
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </motion.div>

              <motion.div
                  className="editorial-hero-visual"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.75, delay: 0.15 }}
              >
                <div className="editorial-hero-topline">
                  <span>CAMPAIGN SPOTLIGHT</span>
                  <span>MATUNGULU</span>
                </div>

                <ImageSlider
                    items={heroSlides}
                    ariaLabel="Campaign spotlight photographs"
                    className="editorial-hero-slider"
                    interval={6000}
                    renderSlide={(item) => (
                        <div className="editorial-hero-slide">
                          <MediaVisual
                              mediaId={item.mediaId}
                              alt={item.title}
                              variant="hero"
                          />

                          <div className="editorial-hero-image-caption">
                            <span>{item.category}</span>
                            <h2>{item.title}</h2>

                            {item.description && (
                                <p>{getExcerpt(item.description, 110)}</p>
                            )}
                          </div>
                        </div>
                    )}
                    emptyMessage="Campaign photographs will appear here when they are published."
                />

                <div className="editorial-hero-bottomline">
                                <span>
                                    {candidate?.full_name || 'MATUNGULU CAMPAIGN'}
                                </span>

                  <span>01 / CAMPAIGN</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TOP STORIES */}

        <div className="editorial-container">
          <EditorialSection
              id="top-stories"
              number="01"
              eyebrow="CAMPAIGN HEADLINES"
              title="Top stories"
              description="Important announcements and headlines published for the people of Matungulu."
              items={headlines}
              emptyMessage="No active campaign headlines have been published yet."
              renderSlide={(item) => (
                  <StorySlide
                      item={item}
                      category="CAMPAIGN HEADLINE"
                      description={item.description}
                      mediaId={item.media_id}
                      linkUrl={item.link_url}
                  />
              )}
          />

          {/* NEWS */}

          <EditorialSection
              id="news"
              number="02"
              eyebrow="LATEST UPDATES"
              title="News and reports"
              description="Read the latest published campaign news and official updates."
              items={news}
              emptyMessage="Published news articles will appear here."
              renderSlide={(item) => (
                  <StorySlide
                      item={item}
                      category="NEWS"
                      description={getExcerpt(item.content, 230)}
                      date={item.published_at}
                      mediaId={item.featured_media_id}
                  />
              )}
          />

          {/* MANIFESTO */}

          <EditorialSection
              id="campaign-priorities"
              number="03"
              eyebrow="OUR PRIORITIES"
              title="Inside the manifesto"
              description="Explore published campaign priorities and the commitments presented to the community."
              items={manifesto}
              emptyMessage="Published campaign priorities will appear here."
              renderSlide={(item) => (
                  <StorySlide
                      item={item}
                      category="CAMPAIGN PRIORITY"
                      description={item.description}
                      mediaId={item.media_id}
                  />
              )}
          />

          {/* EVENTS */}

          <EditorialSection
              id="events"
              number="04"
              eyebrow="COMMUNITY ACTIVITIES"
              title="Upcoming events"
              description="Find published campaign meetings, community activities and scheduled events."
              items={events}
              emptyMessage="No published upcoming events are available."
              renderSlide={(item) => (
                  <StorySlide
                      item={item}
                      category="CAMPAIGN EVENT"
                      description={item.description}
                      mediaId={item.media_id}
                      date={item.event_date}
                  />
              )}
          />

          {/* EVENT INFORMATION */}

          {events.length > 0 && (
              <section className="editorial-event-details">
                <div className="editorial-section-heading">
                  <div>
                                <span className="editorial-eyebrow">
                                    EVENT INFORMATION
                                </span>
                    <h2>Dates and locations</h2>
                  </div>

                  <CalendarDays size={30} />
                </div>

                <div className="editorial-event-list">
                  {events.map((event) => (
                      <article
                          className="editorial-event-row"
                          key={event.id}
                      >
                        <div className="editorial-event-date">
                          <strong>
                            {formatDate(event.event_date)}
                          </strong>

                          {event.start_time && (
                              <span>
                                                <Clock3 size={13} />
                                {formatTime(event.start_time)}
                                            </span>
                          )}
                        </div>

                        <div className="editorial-event-copy">
                          <h3>{event.title}</h3>

                          {event.location && (
                              <span>
                                                <MapPin size={13} />
                                {event.location}
                                            </span>
                          )}
                        </div>
                      </article>
                  ))}
                </div>
              </section>
          )}

          {/* CAMPAIGN POSTERS */}

          <EditorialSection
              id="campaign-gallery"
              number="05"
              eyebrow="CAMPAIGN MEDIA"
              title="Campaign gallery"
              description="Browse published campaign posters and visual announcements."
              items={posters.filter((poster) => poster.preview_media_id)}
              emptyMessage="Published campaign posters will appear here."
              renderSlide={(item) => (
                  <StorySlide
                      item={item}
                      category="CAMPAIGN POSTER"
                      description={item.description}
                      mediaId={item.preview_media_id}
                  />
              )}
          />

          {/* CAMPAIGN SCHEDULE */}

          {schedule.length > 0 && (
              <section className="editorial-schedule-section">
                <div className="editorial-section-heading">
                  <div>
                                <span className="editorial-eyebrow">
                                    CAMPAIGN PROGRAMME
                                </span>

                    <h2>Scheduled activities</h2>
                  </div>

                  <CalendarDays size={30} />
                </div>

                <div className="editorial-schedule-list">
                  {schedule.map((entry) => (
                      <article
                          key={entry.id}
                          className="editorial-schedule-item"
                      >
                        <div className="editorial-schedule-date">
                          <strong>
                            {formatDate(entry.scheduled_date)}
                          </strong>

                          {entry.scheduled_time && (
                              <span>
                                                <Clock3 size={13} />
                                {formatTime(entry.scheduled_time)}
                                            </span>
                          )}
                        </div>

                        <div>
                          <h3>{entry.title}</h3>

                          {entry.description && (
                              <p>{entry.description}</p>
                          )}

                          {entry.location && (
                              <span>
                                                <MapPin size={13} />
                                {entry.location}
                                            </span>
                          )}
                        </div>
                      </article>
                  ))}
                </div>
              </section>
          )}
        </div>

        {/* CLOSING STRIP */}

        <section className="editorial-closing">
          <div className="editorial-container">
            <div className="editorial-closing-inner">
              <div>
                            <span className="editorial-eyebrow">
                                MATUNGULU CAMPAIGN
                            </span>

                <h2>
                  Informed communities.
                  <br />
                  Meaningful engagement.
                </h2>
              </div>

              <a href="#top-stories">
                Explore the latest
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>

      </main>
  )
}

export default HomePage
