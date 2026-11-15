
import { FileText, Download, Image as ImageIcon } from 'lucide-react'
import { publicApi } from '../../services/api'
import { usePublicResources } from '../../hooks/usePublicResources'

function PublicResources() {
  const {
    documents,
    posters,
    errors,
    isLoading,
  } = usePublicResources()

  return (
    <>
      <section className="public-resource-section" id="resources">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PUBLIC LIBRARY</span>
            <h2>Campaign documents</h2>
          </div>
          <FileText size={34} strokeWidth={1.3} />
        </div>

        {isLoading ? (
          <p className="content-state">Loading campaign documents...</p>
        ) : errors.documents ? (
          <p className="content-state content-error" role="alert">
            {errors.documents}
          </p>
        ) : documents.length === 0 ? (
          <p className="content-state">
            No public campaign documents have been published yet.
          </p>
        ) : (
          <div className="public-document-grid">
            {documents.map((document) => (
              <article className="public-document-card" key={document.id}>
                <div className="public-resource-icon">
                  <FileText size={23} />
                </div>

                <div className="public-document-copy">
                  <h3>{document.title}</h3>

                  {document.category && (
                    <span className="public-resource-category">
                      {document.category}
                    </span>
                  )}

                  {document.description && (
                    <p>{document.description}</p>
                  )}

                  <small>
                    {document.download_count} downloads
                  </small>
                </div>

                {document.media_id && (
                  <a
                    className="public-download-link"
                    href={publicApi.getDocumentDownloadUrl(document.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${document.title}`}
                  >
                    Download <Download size={15} />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="public-resource-section public-poster-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CAMPAIGN GALLERY</span>
            <h2>Posters and artwork</h2>
          </div>
          <ImageIcon size={34} strokeWidth={1.3} />
        </div>

        {isLoading ? (
          <p className="content-state">Loading campaign posters...</p>
        ) : errors.posters ? (
          <p className="content-state content-error" role="alert">
            {errors.posters}
          </p>
        ) : posters.length === 0 ? (
          <p className="content-state">
            Campaign posters will appear here when published.
          </p>
        ) : (
          <div className="public-poster-grid">
            {posters.map((poster) => (
              <article className="public-poster-card" key={poster.id}>
                {poster.preview_media_id ? (
                  <a
                    href={publicApi.getPosterPreviewUrl(poster.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-poster-image-link"
                  >
                    <img
                      src={publicApi.getPosterPreviewUrl(poster.id)}
                      alt={poster.title}
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="public-poster-placeholder">
                    <ImageIcon size={34} />
                    <span>Preview unavailable</span>
                  </div>
                )}

                <div className="public-poster-copy">
                  <h3>{poster.title}</h3>

                  {poster.description && (
                    <p>{poster.description}</p>
                  )}

                  {poster.download_media_id && (
                    <a
                      className="public-download-link"
                      href={publicApi.getPosterDownloadUrl(poster.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download poster <Download size={15} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default PublicResources
