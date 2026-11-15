
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    RefreshCw,
    Save,
    Pencil,
    Trash2,
    Upload,
} from 'lucide-react'
import { adminApi, mediaApi } from '../../services/api'
import MediaPicker from '../../components/common/MediaPicker'

const modules = {
    events: {
        title: 'Campaign events',
        fields: [
            { name: 'title', label: 'Event title', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'location', label: 'Location' },
            {
                name: 'event_date',
                label: 'Event date',
                type: 'date',
                required: true,
            },
            { name: 'start_time', label: 'Start time', type: 'time' },
            { name: 'end_time', label: 'End time', type: 'time' },
            { name: 'media_id', label: 'Event image', type: 'images' },
        ],
        load: () => adminApi.listEvents(),
        create: (payload) => adminApi.createEvent(payload),
        update: (id, payload) => adminApi.updateEvent(id, payload),
        remove: (id) => adminApi.deleteEvent(id),
        publish: (record) =>
            adminApi.updateEventPublication(record.id, {
                is_published: !record.is_published,
            }),
        updateOrder: null,
    },

    documents: {
        title: 'Campaign documents',
        fields: [
            { name: 'title', label: 'Document title', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'category', label: 'Category' },
            {
                name: 'display_order',
                label: 'Display order',
                type: 'number',
            },
            {
                name: 'file',
                label: 'PDF document',
                type: 'file',
            },
        ],
        load: () => adminApi.listDocuments(),
        create: (payload) => adminApi.createDocument(payload),
        update: (id, payload) => adminApi.updateDocument(id, payload),
        remove: (id) => adminApi.deleteDocument(id),
        publish: (record) =>
            adminApi.updateDocumentPublication(record.id, {
                is_published: !record.is_published,
            }),
        updateOrder: (id, order) =>
            adminApi.updateDocumentOrder(id, {
                display_order: order,
            }),
    },

    posters: {
        title: 'Campaign posters',
        fields: [
            { name: 'title', label: 'Poster title', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            {
                name: 'category_id',
                label: 'Poster category',
                type: 'categories',
            },
            {
                name: 'preview_media_id',
                label: 'Preview image',
                type: 'images',
            },
            {
                name: 'download_media_id',
                label: 'Download image',
                type: 'images',
            },
            {
                name: 'display_order',
                label: 'Display order',
                type: 'number',
            },
        ],
        load: () => adminApi.listPosters(),
        create: (payload) => adminApi.createPoster(payload),
        update: (id, payload) => adminApi.updatePoster(id, payload),
        remove: (id) => adminApi.deletePoster(id),
        publish: (record) =>
            adminApi.updatePosterPublication(record.id, {
                is_published: !record.is_published,
            }),
        updateOrder: (id, order) =>
            adminApi.updatePosterOrder(id, {
                display_order: order,
            }),
    },

    navigation: {
        title: 'Website navigation',
        fields: [
            { name: 'title', label: 'Menu title', required: true },
            { name: 'url', label: 'URL or page anchor', required: true },
            {
                name: 'parent_id',
                label: 'Parent menu',
                type: 'parents',
            },
            {
                name: 'display_order',
                label: 'Display order',
                type: 'number',
            },
        ],
        load: () => adminApi.listNavigation(),
        create: (payload) => adminApi.createNavigation(payload),
        update: (id, payload) => adminApi.updateNavigation(id, payload),
        remove: (id) => adminApi.deleteNavigation(id),
        updateOrder: (id, order) =>
            adminApi.updateNavigationOrder(id, {
                display_order: order,
            }),
    },
}

const settingsFields = [
    { name: 'site_name', label: 'Website name' },
    {
        name: 'site_description',
        label: 'Website description',
        type: 'textarea',
    },
    { name: 'primary_color', label: 'Primary colour' },
    { name: 'secondary_color', label: 'Secondary colour' },
    { name: 'contact_phone', label: 'Contact phone' },
    {
        name: 'contact_email',
        label: 'Contact email',
        type: 'email',
    },
    {
        name: 'office_address',
        label: 'Office address',
        type: 'textarea',
    },
]

function emptyForm(fields) {
    return Object.fromEntries(
        fields.map((field) => [
            field.name,
            field.type === 'number' ? '0' : '',
        ]),
    )
}

function formatBytes(value) {
    if (!value) return '0 B'

    if (value < 1024) {
        return `${value} B`
    }

    if (value < 1024 * 1024) {
        return `${(value / 1024).toFixed(1)} KB`
    }

    return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

// async function fetchMediaPage(page, search) {
//     try {
//         const result = await mediaApi.listMedia({
//             page,
//             per_page: 30,
//             search,
//         })
//
//         return {
//             items: result.items || [],
//             totalPages: result.total_pages || 0,
//             error: '',
//         }
//     } catch (err) {
//         return {
//             items: [],
//             totalPages: 0,
//             error: err.message || 'Unable to load media library.',
//         }
//     }
// }

/* =========================================================
   MEDIA LIBRARY
========================================================= */


function MediaThumbnail({ media, onClick, removable = false, onRemove }) {
    const [imageUrl, setImageUrl] = useState('')
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        let active = true
        let objectUrl = ''

        async function loadImage() {
            try {
                const blob = await mediaApi.getMediaFile(media.id)

                if (!active) return

                objectUrl = URL.createObjectURL(blob)
                setImageUrl(objectUrl)
            } catch {
                if (active) setImageError(true)
            }
        }

        loadImage()

        return () => {
            active = false

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [media.id])

    return (
        <article className="content-record">
            <div>
                {imageUrl && !imageError ? (
                    <button
                        type="button"
                        onClick={onClick}
                        aria-label={`View ${media.original_filename}`}
                        style={{
                            display: 'block',
                            width: '100%',
                            maxWidth: '220px',
                            padding: 0,
                            border: 0,
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                    >
                        <img
                            src={imageUrl}
                            alt={media.alt_text || media.original_filename}
                            style={{
                                display: 'block',
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                            }}
                        />
                    </button>
                ) : (
                    <div className="content-state">
                        {imageError ? 'Image unavailable' : 'Loading image...'}
                    </div>
                )}

                <strong>{media.original_filename}</strong>

                <small>
                    {media.mime_type} · {formatBytes(media.file_size)}
                </small>

                {media.alt_text && <p>{media.alt_text}</p>}
                {media.caption && <p>{media.caption}</p>}

                <small>{media.id}</small>
            </div>

            {removable && onRemove && (
                <button
                    type="button"
                    className="team-action-button"
                    onClick={onRemove}
                >
                    <Trash2 size={14} />
                    Remove from album
                </button>
            )}
        </article>
    )
}

function MediaLibraryPage() {
    const [items, setItems] = useState([])
    const [search, setSearch] = useState('')
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    const [files, setFiles] = useState([])
    const uploadFormRef = useRef(null)
    const [altText, setAltText] = useState('')
    const [caption, setCaption] = useState('')

    const [albums, setAlbums] = useState([])
    const [selectedAlbumId, setSelectedAlbumId] = useState('')
    const [selectedAlbum, setSelectedAlbum] = useState(null)

    const [albumTitle, setAlbumTitle] = useState('')
    const [albumDescription, setAlbumDescription] = useState('')
    const [albumOrder, setAlbumOrder] = useState('0')
    const [editingAlbumId, setEditingAlbumId] = useState(null)
    const [albumPublished, setAlbumPublished] = useState(false)

    const [addMediaId, setAddMediaId] = useState('')

    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [savingAlbum, setSavingAlbum] = useState(false)
    const [albumBusy, setAlbumBusy] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fetchMedia = useCallback(async () => {
        try {
            const result = await mediaApi.listMedia({
                page,
                per_page: 30,
                search: query,
            })

            return {
                items: result.items || [],
                totalPages: result.total_pages || 0,
                error: '',
            }
        } catch (err) {
            return {
                items: [],
                totalPages: 0,
                error: err.message || 'Unable to load media library.',
            }
        }
    }, [page, query])

    const fetchAlbums = useCallback(async () => {
        try {
            const result = await mediaApi.listAlbums()
            setAlbums(Array.isArray(result) ? result : [])
        } catch (err) {
            setError(err.message || 'Unable to load albums.')
        }
    }, [])

    const loadAlbum = useCallback(async (albumId) => {
        if (!albumId) {
            setSelectedAlbum(null)
            return
        }

        setAlbumBusy(true)

        try {
            const result = await mediaApi.getAlbum(albumId)
            setSelectedAlbum(result)
        } catch (err) {
            setSelectedAlbum(null)
            setError(err.message || 'Unable to load album.')
        } finally {
            setAlbumBusy(false)
        }
    }, [])

    useEffect(() => {
        let active = true

        async function initialLoad() {
            const [mediaResult] = await Promise.all([
                fetchMedia(),
                fetchAlbums(),
            ])

            if (!active) return

            setItems(mediaResult.items)
            setTotalPages(mediaResult.totalPages)
            setError(mediaResult.error)
            setLoading(false)
        }

        initialLoad()

        return () => {
            active = false
        }
    }, [fetchMedia, fetchAlbums])

    useEffect(() => {
        if (!selectedAlbumId) {
            return
        }

        let cancelled = false

        const fetchSelectedAlbum = async () => {
            setAlbumBusy(true)
            setError('')

            try {
                const result = await mediaApi.getAlbum(selectedAlbumId)

                if (!cancelled) {
                    setSelectedAlbum(result)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Unable to load album.')
                    setSelectedAlbum(null)
                }
            } finally {
                if (!cancelled) {
                    setAlbumBusy(false)
                }
            }
        }

        fetchSelectedAlbum()

        return () => {
            cancelled = true
        }
    }, [selectedAlbumId])

    const loadMedia = async () => {
        setLoading(true)
        setError('')

        const result = await fetchMedia()

        setItems(result.items)
        setTotalPages(result.totalPages)
        setError(result.error)
        setLoading(false)
    }

    const handleSearch = (event) => {
        event.preventDefault()
        setLoading(true)
        setPage(1)
        setQuery(search.trim())
    }

    const handleUpload = async (event) => {
        event.preventDefault()

        if (files.length === 0) {
            setError('Please select at least one image to upload.')
            return
        }

        const invalidFiles = files.filter(
            (selectedFile) =>
                !['image/jpeg', 'image/png', 'image/webp'].includes(
                    selectedFile.type,
                ) ||
                selectedFile.size > 8 * 1024 * 1024,
        )

        if (invalidFiles.length > 0) {
            setError(
                `These files are invalid or exceed the 8 MB limit: ${
                    invalidFiles.map((item) => item.name).join(', ')
                }`,
            )
            return
        }

        setUploading(true)
        setError('')
        setSuccess('')

        let uploadedCount = 0
        const failedFiles = []

        try {
            for (const selectedFile of files) {
                const data = new FormData()

                data.append('file', selectedFile)

                if (altText.trim()) {
                    data.append('alt_text', altText.trim())
                }

                if (caption.trim()) {
                    data.append('caption', caption.trim())
                }

                try {
                    await mediaApi.uploadImage(data)
                    uploadedCount += 1
                } catch (err) {
                    failedFiles.push({
                        name: selectedFile.name,
                        reason: err.message || 'Upload failed',
                    })
                }
            }

            if (uploadedCount > 0) {
                setSuccess(
                    `${uploadedCount} of ${files.length} image(s) uploaded successfully.`,
                )

                setFiles([])
                setAltText('')
                setCaption('')
                setSearch('')
                setQuery('')
                setPage(1)

                uploadFormRef.current?.reset()

                const refreshed = await mediaApi.listMedia({
                    page: 1,
                    per_page: 30,
                })

                setItems(refreshed.items || [])
                setTotalPages(refreshed.total_pages || 0)
            }

            if (failedFiles.length > 0) {
                setError(
                    failedFiles.map(
                        (item) => `${item.name}: ${item.reason}`,
                    ).join('\n'),
                )
            }

            if (uploadedCount === 0 && failedFiles.length === 0) {
                setError('No images were uploaded.')
            }
        } catch (err) {
            setError(
                err.message || 'Unable to refresh the media library.',
            )
        } finally {
            setUploading(false)
        }
    }

    const resetAlbumForm = () => {
        setAlbumTitle('')
        setAlbumDescription('')
        setAlbumOrder('0')
        setAlbumPublished(false)
        setEditingAlbumId(null)
    }

    const editAlbum = (album) => {
        setEditingAlbumId(album.id)
        setAlbumTitle(album.title || '')
        setAlbumDescription(album.description || '')
        setAlbumOrder(String(album.display_order ?? 0))
        setAlbumPublished(Boolean(album.is_published))
        setError('')
        setSuccess('')
    }

    const handleSaveAlbum = async (event) => {
        event.preventDefault()

        if (!albumTitle.trim()) {
            setError('Album title is required.')
            return
        }

        const order = Number(albumOrder)

        if (!Number.isInteger(order) || order < 0) {
            setError('Album display order must be a non-negative integer.')
            return
        }

        setSavingAlbum(true)
        setError('')
        setSuccess('')

        try {
            const payload = {
                title: albumTitle.trim(),
                description: albumDescription.trim() || null,
                display_order: order,
            }

            if (editingAlbumId) {
                await mediaApi.updateAlbum(editingAlbumId, {
                    ...payload,
                    is_published: albumPublished,
                })

                setSuccess('Album updated successfully.')
            } else {
                await mediaApi.createAlbum(payload)
                setSuccess('Album created successfully.')
            }

            resetAlbumForm()
            await fetchAlbums()

            if (selectedAlbumId) {
                await loadAlbum(selectedAlbumId)
            }
        } catch (err) {
            setError(err.message || 'Unable to save album.')
        } finally {
            setSavingAlbum(false)
        }
    }

    const handleAddMedia = async (event) => {
        event.preventDefault()

        if (!selectedAlbumId || !addMediaId) {
            setError('Select an album and an image.')
            return
        }

        setAlbumBusy(true)
        setError('')
        setSuccess('')

        try {
            await mediaApi.addMediaToAlbum(
                selectedAlbumId,
                addMediaId,
            )

            setAddMediaId('')
            setSuccess('Image added to album.')

            await loadAlbum(selectedAlbumId)
            await fetchAlbums()
        } catch (err) {
            setError(err.message || 'Unable to add image to album.')
        } finally {
            setAlbumBusy(false)
        }
    }

    const handleRemoveMedia = async (mediaId) => {
        if (!selectedAlbumId) return

        if (!window.confirm('Remove this image from the album?')) {
            return
        }

        setAlbumBusy(true)
        setError('')
        setSuccess('')

        try {
            await mediaApi.removeMediaFromAlbum(
                selectedAlbumId,
                mediaId,
            )

            setSuccess('Image removed from album. The original file is preserved.')

            await loadAlbum(selectedAlbumId)
            await fetchAlbums()
        } catch (err) {
            setError(err.message || 'Unable to remove image from album.')
        } finally {
            setAlbumBusy(false)
        }
    }

    return (
        <section className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">CAMPAIGN ASSETS</span>
                    <h1>Media library</h1>
                    <p>
                        Upload images, organize campaign albums and manage existing assets.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh"
                    onClick={() => {
                        loadMedia()
                        fetchAlbums()
                    }}
                    disabled={loading}
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="dashboard-api-error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <p className="content-state" role="status">
                    {success}
                </p>
            )}

            <div className="team-layout">
                <div className="dashboard-panel">
                    <h2>Upload image</h2>
                    <p>JPEG, PNG and WebP images up to 8 MB.</p>

                    <form
                        ref={uploadFormRef}
                        className="team-form"
                        onSubmit={handleUpload}
                    >
                        <label>
                            Select image
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                required
                                onChange={(event) =>
                                    setFiles(Array.from(event.target.files || []))
                                }
                            />

                            {files.length > 0 && (
                                <small>
                                    {files.length} image(s) selected.
                                    Maximum size: 8 MB per image.
                                </small>
                            )}
                        </label>

                        <label>
                            Alternative text
                            <input
                                value={altText}
                                onChange={(event) => setAltText(event.target.value)}
                                maxLength={255}
                            />
                        </label>

                        <label>
                            Caption
                            <textarea
                                value={caption}
                                onChange={(event) => setCaption(event.target.value)}
                                rows={3}
                                maxLength={5000}
                            />
                        </label>

                        <button
                            className="button button-primary"
                            type="submit"
                            disabled={files.length === 0 || uploading}
                        >
                            <Upload size={16}/>
                            {uploading ? 'Uploading...' : 'Upload image'}
                        </button>
                    </form>
                </div>

                <div className="dashboard-panel">
                <h2>Uploaded files</h2>

                    <form onSubmit={handleSearch} className="team-form">
                        <label>
                            Search files
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Filename, caption or alt text"
                            />
                        </label>

                        <button
                            type="submit"
                            className="dashboard-refresh"
                            disabled={loading}
                        >
                            Search
                        </button>
                    </form>

                    {loading ? (
                        <p className="content-state">Loading media...</p>
                    ) : items.length === 0 ? (
                        <p className="content-state">No uploaded files found.</p>
                    ) : (
                        <div className="content-record-list">
                            {items.map((item) => (
                                <MediaThumbnail
                                    key={item.id}
                                    media={item}
                                />
                            ))}
                        </div>
                    )}

                    <div className="content-record-actions">
                        <button
                            type="button"
                            className="team-action-button"
                            disabled={loading || page <= 1}
                            onClick={() => setPage((value) => value - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {page} of {Math.max(totalPages, 1)}
                        </span>

                        <button
                            type="button"
                            className="team-action-button"
                            disabled={loading || page >= totalPages}
                            onClick={() => setPage((value) => value + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-panel">
                <div className="panel-heading">
                    <span className="eyebrow">MEDIA ORGANIZATION</span>
                    <span>{albums.length} albums</span>
                </div>

                <h2>Albums</h2>
                <p>Create albums and group existing campaign images.</p>

                <div className="team-layout">
                    <div>
                        <form className="team-form" onSubmit={handleSaveAlbum}>
                            <h3>{editingAlbumId ? 'Edit album' : 'Create album'}</h3>

                            <label>
                                Album title
                                <input
                                    value={albumTitle}
                                    onChange={(event) => setAlbumTitle(event.target.value)}
                                    required
                                    maxLength={255}
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    rows={3}
                                    value={albumDescription}
                                    onChange={(event) =>
                                        setAlbumDescription(event.target.value)
                                    }
                                />
                            </label>

                            <label>
                                Display order
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={albumOrder}
                                    onChange={(event) => setAlbumOrder(event.target.value)}
                                />
                            </label>

                            {editingAlbumId && (
                                <label>
                                    Publication status
                                    <select
                                        value={albumPublished ? 'true' : 'false'}
                                        onChange={(event) =>
                                            setAlbumPublished(event.target.value === 'true')
                                        }
                                    >
                                        <option value="false">Draft</option>
                                        <option value="true">Published</option>
                                    </select>
                                </label>
                            )}

                            <button
                                className="button button-primary"
                                type="submit"
                                disabled={savingAlbum}
                            >
                                <Save size={16} />
                                {savingAlbum
                                    ? 'Saving...'
                                    : editingAlbumId
                                        ? 'Save album'
                                        : 'Create album'}
                            </button>

                            {editingAlbumId && (
                                <button
                                    type="button"
                                    className="dashboard-refresh"
                                    onClick={resetAlbumForm}
                                >
                                    Cancel editing
                                </button>
                            )}
                        </form>
                    </div>

                    <div>
                        {albums.length === 0 ? (
                            <p className="content-state">No albums created yet.</p>
                        ) : (
                            <div className="content-record-list">
                                {albums.map((album) => (
                                    <article className="content-record" key={album.id}>
                                        <div>
                                            <strong>{album.title}</strong>
                                            <small>
                                                {album.media_count} images ·{' '}
                                                {album.is_published ? 'Published' : 'Draft'}
                                            </small>
                                            {album.description && <p>{album.description}</p>}
                                        </div>

                                        <div className="content-record-actions">
                                            <button
                                                type="button"
                                                className="team-action-button"
                                                onClick={() => {
                                                    setSelectedAlbumId(album.id)
                                                    editAlbum(album)
                                                }}
                                            >
                                                <Pencil size={14} />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="team-action-button"
                                                onClick={() => setSelectedAlbumId(album.id)}
                                            >
                                                Open album
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedAlbumId && (
                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <span className="eyebrow">SELECTED ALBUM</span>

                        <button
                            type="button"
                            className="dashboard-refresh"
                            onClick={() => setSelectedAlbumId('')}
                        >
                            Close
                        </button>
                    </div>

                    <h2>{selectedAlbum?.album?.title || 'Album contents'}</h2>

                    {albumBusy ? (
                        <p className="content-state">Loading album...</p>
                    ) : selectedAlbum ? (
                        <>
                            <form className="team-form" onSubmit={handleAddMedia}>
                                <label>
                                    Add an existing image
                                    <select
                                        value={addMediaId}
                                        onChange={(event) => setAddMediaId(event.target.value)}
                                    >
                                        <option value="">Select an image</option>

                                        {items
                                            .filter(
                                                (item) =>
                                                    !(selectedAlbum.media || []).some(
                                                        (media) => media.id === item.id,
                                                    ),
                                            )
                                            .map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.original_filename}
                                                </option>
                                            ))}
                                    </select>
                                </label>

                                <button
                                    className="button button-primary"
                                    type="submit"
                                    disabled={!addMediaId || albumBusy}
                                >
                                    Add image to album
                                </button>
                            </form>

                            {(selectedAlbum.media || []).length === 0 ? (
                                <p className="content-state">
                                    This album does not contain any images.
                                </p>
                            ) : (
                                <div className="content-record-list">
                                    {selectedAlbum.media.map((media) => (
                                        <MediaThumbnail
                                            key={media.id}
                                            media={media}
                                            removable
                                            onRemove={() => handleRemoveMedia(media.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="content-state">
                            Album details could not be loaded.
                        </p>
                    )}
                </div>
            )}
        </section>
    )
}


/* =========================================================
   WEBSITE SETTINGS
========================================================= */

function SettingsManagementPage() {
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fetchSettings = useCallback(async () => {
        try {
            const data = await adminApi.getSiteSettings()

            return {
                data: data || {},
                error: '',
            }
        } catch (err) {
            return {
                data: {},
                error: err.message || 'Unable to load website settings.',
            }
        }
    }, [])

    useEffect(() => {
        let active = true

        async function initialLoad() {
            const result = await fetchSettings()

            if (!active) return

            setForm(result.data)
            setError(result.error)
            setLoading(false)
        }

        initialLoad()

        return () => {
            active = false
        }
    }, [fetchSettings])

    const loadSettings = async () => {
        setLoading(true)
        setError('')

        const result = await fetchSettings()

        setForm(result.data)
        setError(result.error)
        setLoading(false)
    }

    const handleSave = async (event) => {
        event.preventDefault()

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const payload = {}

            settingsFields.forEach(({ name }) => {
                payload[name] =
                    String(form[name] || '').trim() || null
            })

            const updated = await adminApi.updateSiteSettings(payload)

            setForm(updated || payload)
            setSuccess('Website settings saved successfully.')
        } catch (err) {
            setError(
                err.message || 'Unable to save website settings.',
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <p className="content-state">
                Loading website settings...
            </p>
        )
    }

    return (
        <section className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">
                        WEBSITE CONFIGURATION
                    </span>

                    <h1>Workspace settings</h1>

                    <p>
                        Update the public website identity and contact information.
                    </p>
                </div>

                <button
                    className="dashboard-refresh"
                    onClick={loadSettings}
                    type="button"
                    disabled={loading}
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="dashboard-api-error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <p className="content-state" role="status">
                    {success}
                </p>
            )}

            <div className="dashboard-panel">
                <form
                    className="team-form"
                    onSubmit={handleSave}
                >
                    {settingsFields.map((field) => (
                        <label key={field.name}>
                            {field.label}

                            {field.type === 'textarea' ? (
                                <textarea
                                    rows={4}
                                    value={form[field.name] || ''}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            [field.name]: event.target.value,
                                        }))
                                    }
                                />
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    value={form[field.name] || ''}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            [field.name]: event.target.value,
                                        }))
                                    }
                                />
                            )}
                        </label>
                    ))}

                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={saving}
                    >
                        <Save size={16} />

                        {saving ? 'Saving...' : 'Save website settings'}
                    </button>
                </form>
            </div>
        </section>
    )
}

/* =========================================================
   SHARED RECORD MANAGEMENT
   Events, Documents, Posters and Navigation
========================================================= */

function RecordManagementPage({ section }) {
    const config = modules[section]

    const [records, setRecords] = useState([])
    const [extras, setExtras] = useState({
        images: [],
        categories: [],
    })

    const [form, setForm] = useState(emptyForm(config.fields))
    const [editingId, setEditingId] = useState(null)
    const [orderValues, setOrderValues] = useState({})

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [busyId, setBusyId] = useState(null)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const fetchRecords = useCallback(async () => {
        let rows

        try {
            const result = await config.load()
            rows = Array.isArray(result) ? result : []
        } catch (err) {
            return {
                records: [],
                images: [],
                categories: [],
                error:
                    err.message ||
                    `Unable to load ${config.title.toLowerCase()}.`,
            }
        }

        let categories = []
        let extrasError = ''

        if (section === 'posters') {
            try {
                const result = await adminApi.listPosterCategories()
                categories = Array.isArray(result) ? result : []
            } catch (err) {
                extrasError =
                    err.message || 'Unable to load poster categories.'
            }
        }

        return {
            records: rows,
            images: [],
            categories,
            error: extrasError,
        }
    }, [config, section])

    useEffect(() => {
        let active = true

        async function initialLoad() {
            const result = await fetchRecords()

            if (!active) return

            setRecords(result.records)

            setExtras({
                images: result.images,
                categories: result.categories,
            })

            setOrderValues(
                Object.fromEntries(
                    result.records.map((record) => [
                        record.id,
                        String(record.display_order ?? 0),
                    ]),
                ),
            )

            setError(result.error)
            setLoading(false)
        }

        initialLoad()

        return () => {
            active = false
        }
    }, [fetchRecords])

    const loadRecords = async () => {
        setLoading(true)
        setError('')

        const result = await fetchRecords()

        setRecords(result.records)

        setExtras({
            images: result.images,
            categories: result.categories,
        })

        setOrderValues(
            Object.fromEntries(
                result.records.map((record) => [
                    record.id,
                    String(record.display_order ?? 0),
                ]),
            ),
        )

        setError(result.error)
        setLoading(false)
    }

    const editRecord = (record) => {
        const next = {}

        config.fields.forEach((field) => {
            let value = record[field.name] ?? ''

            if (field.type === 'time' && value) {
                value = value.slice(0, 5)
            }

            next[field.name] = value
        })

        setForm(next)
        setEditingId(record.id)
        setError('')
        setSuccess('')
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setForm(emptyForm(config.fields))
        setError('')
    }

    const handleSave = async (event) => {
        event.preventDefault()

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const payload = {}

            config.fields.forEach((field) => {
                if (field.type === 'file') return

                const value = form[field.name]

                if (field.type === 'number') {
                    payload[field.name] = Number(value || 0)
                } else if (field.type === 'time') {
                    payload[field.name] = value
                        ? value.length === 5
                            ? `${value}:00`
                            : value
                        : null
                } else {
                    const cleaned = String(value || '').trim()

                    payload[field.name] = cleaned || null
                }
            })

            /* Document PDF upload */
            if (section === 'documents') {
                const uploadedFile = form.file

                if (uploadedFile) {
                    const upload = new FormData()
                    upload.append('file', uploadedFile)

                    const media = await adminApi.uploadDocument(upload)

                    payload.media_id = media.id
                } else {
                    const existing = records.find(
                        (record) => record.id === editingId,
                    )

                    payload.media_id = existing?.media_id || null

                    if (!editingId && !payload.media_id) {
                        throw new Error('Please select a PDF document.')
                    }
                }
            }

            /* Keep navigation visibility when editing */
            if (section === 'navigation' && editingId) {
                const existing = records.find(
                    (record) => record.id === editingId,
                )

                payload.is_visible = existing?.is_visible ?? true
            }

            if (editingId) {
                await config.update(editingId, payload)
            } else {
                await config.create(payload)
            }

            setSuccess(`${config.title} saved successfully.`)

            setEditingId(null)
            setForm(emptyForm(config.fields))

            await loadRecords()
        } catch (err) {
            setError(
                err.message ||
                `Unable to save ${config.title.toLowerCase()}.`,
            )
        } finally {
            setSaving(false)
        }
    }

    const handlePublish = async (record) => {
        const action = record.is_published ? 'Unpublish' : 'Publish'

        if (!window.confirm(`${action} "${record.title}"?`)) {
            return
        }

        setBusyId(record.id)
        setError('')
        setSuccess('')

        try {
            await config.publish(record)

            setSuccess('Publication status updated.')

            await loadRecords()
        } catch (err) {
            setError(
                err.message || 'Unable to update publication status.',
            )
        } finally {
            setBusyId(null)
        }
    }

    const handleVisibility = async (record) => {
        const visible = !record.is_visible

        setBusyId(record.id)
        setError('')
        setSuccess('')

        try {
            await adminApi.updateNavigationVisibility(record.id, {
                is_visible: visible,
            })

            setSuccess('Navigation visibility updated.')

            await loadRecords()
        } catch (err) {
            setError(
                err.message || 'Unable to update navigation visibility.',
            )
        } finally {
            setBusyId(null)
        }
    }

    const handleEventStatus = async (record, status) => {
        setBusyId(record.id)
        setError('')
        setSuccess('')

        try {
            await adminApi.updateEventStatus(record.id, {
                status,
            })

            setSuccess('Event status updated.')

            await loadRecords()
        } catch (err) {
            setError(err.message || 'Unable to update event status.')
        } finally {
            setBusyId(null)
        }
    }

    const handleOrder = async (record) => {
        if (!config.updateOrder) return

        const order = Number(orderValues[record.id])

        if (
            !Number.isInteger(order) ||
            order < 0 ||
            order > 1000000
        ) {
            setError('Display order must be between 0 and 1000000.')
            return
        }

        setBusyId(record.id)
        setError('')
        setSuccess('')

        try {
            await config.updateOrder(record.id, order)

            setSuccess('Display order updated.')

            await loadRecords()
        } catch (err) {
            setError(err.message || 'Unable to update display order.')
        } finally {
            setBusyId(null)
        }
    }

    const handleDelete = async (record) => {
        if (
            !window.confirm(
                `Permanently delete "${record.title}"?`,
            )
        ) {
            return
        }

        setBusyId(record.id)
        setError('')
        setSuccess('')

        try {
            await config.remove(record.id)

            if (editingId === record.id) {
                setEditingId(null)
                setForm(emptyForm(config.fields))
            }

            setSuccess('Record deleted successfully.')

            await loadRecords()
        } catch (err) {
            setError(err.message || 'Unable to delete record.')
        } finally {
            setBusyId(null)
        }
    }

    const getOptions = (field) => {
        if (field.type === 'images') {
            return extras.images.map((image) => ({
                value: image.id,
                label: image.original_filename,
            }))
        }

        if (field.type === 'categories') {
            return extras.categories.map((category) => ({
                value: category.id,
                label:
                    category.name ||
                    category.title ||
                    category.id,
            }))
        }

        if (field.type === 'parents') {
            return records
                .filter((record) => record.id !== editingId)
                .map((record) => ({
                    value: record.id,
                    label: record.title,
                }))
        }

        return []
    }

    const getRecordStatus = (record) => {
        if (section === 'events') {
            return `${record.status} · ${
                record.is_published ? 'Published' : 'Draft'
            }`
        }

        if (section === 'navigation') {
            return record.is_visible ? 'Visible' : 'Hidden'
        }

        return record.is_published ? 'Published' : 'Draft'
    }

    return (
        <section className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">CAMPAIGN MANAGEMENT</span>

                    <h1>{config.title}</h1>

                    <p>
                        Manage records stored in the campaign database.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh"
                    onClick={loadRecords}
                    disabled={loading}
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="dashboard-api-error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <p className="content-state" role="status">
                    {success}
                </p>
            )}

            <div className="team-layout">
                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <span className="eyebrow">
                            {editingId ? 'EDIT RECORD' : 'NEW RECORD'}
                        </span>

                        <Pencil size={19} />
                    </div>

                    <h2>
                        {editingId ? 'Edit record' : 'Create record'}
                    </h2>

                    <form
                        className="team-form"
                        onSubmit={handleSave}
                    >
                        {config.fields.map((field) => {
                            if (field.type === 'images') {
                                return (
                                    <div
                                        className="media-picker-form-field"
                                        key={field.name}
                                    >
                                        <MediaPicker
                                            label={field.label}
                                            value={form[field.name] || ''}
                                            onChange={(mediaId) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    [field.name]: mediaId,
                                                }))
                                            }
                                            disabled={saving}
                                        />
                                    </div>
                                )
                            }

                            return (
                                <label key={field.name}>
                                    {field.label}

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            rows={4}
                                            value={form[field.name] || ''}
                                            required={field.required}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    [field.name]: event.target.value,
                                                }))
                                            }
                                        />
                                    ) : field.type === 'categories' ||
                                    field.type === 'parents' ? (
                                        <select
                                            value={form[field.name] || ''}
                                            required={field.required}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    [field.name]: event.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">None selected</option>

                                            {getOptions(field).map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === 'file' ? (
                                        <input
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            required={!editingId}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    file: event.target.files?.[0] || null,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <input
                                            type={field.type || 'text'}
                                            value={form[field.name] || ''}
                                            required={field.required}
                                            min={
                                                field.type === 'number'
                                                    ? 0
                                                    : undefined
                                            }
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    [field.name]: event.target.value,
                                                }))
                                            }
                                        />
                                    )}
                                </label>
                            )
                        })}

                        <button
                            type="submit"
                            className="button button-primary"
                            disabled={saving || loading}
                        >
                            <Save size={16} />

                            {saving
                                ? 'Saving...'
                                : editingId
                                    ? 'Save changes'
                                    : 'Create record'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="dashboard-refresh"
                                onClick={handleCancelEdit}
                            >
                                Cancel editing
                            </button>
                        )}
                    </form>
                </div>

                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <span className="eyebrow">DATABASE RECORDS</span>
                        <RefreshCw size={19} />
                    </div>

                    <h2>Existing records</h2>

                    {loading ? (
                        <p className="content-state">
                            Loading records...
                        </p>
                    ) : records.length === 0 ? (
                        <p className="content-state">
                            No records have been created.
                        </p>
                    ) : (
                        <div className="content-record-list">
                            {records.map((record) => (
                                <article
                                    className="content-record"
                                    key={record.id}
                                >
                                    <div>
                                        <strong>{record.title}</strong>

                                        <small>
                                            {getRecordStatus(record)}
                                        </small>

                                        <p>
                                            {record.description ||
                                                record.location ||
                                                record.url ||
                                                ''}
                                        </p>

                                        {section === 'documents' && (
                                            <small>
                                                {record.media_id
                                                    ? 'PDF attached'
                                                    : 'No PDF attached'}
                                            </small>
                                        )}

                                        {section === 'posters' && (
                                            <small>
                                                {record.preview_media_id
                                                    ? 'Preview image attached'
                                                    : 'No preview image'}
                                            </small>
                                        )}
                                    </div>

                                    <div className="content-record-actions">
                                        <button
                                            type="button"
                                            className="team-action-button"
                                            onClick={() => editRecord(record)}
                                        >
                                            <Pencil size={14} />
                                            Edit
                                        </button>

                                        {config.publish && (
                                            <button
                                                type="button"
                                                className="team-action-button"
                                                disabled={busyId === record.id}
                                                onClick={() => handlePublish(record)}
                                            >
                                                {busyId === record.id
                                                    ? 'Updating...'
                                                    : record.is_published
                                                        ? 'Unpublish'
                                                        : 'Publish'}
                                            </button>
                                        )}

                                        {section === 'navigation' && (
                                            <button
                                                type="button"
                                                className="team-action-button"
                                                disabled={busyId === record.id}
                                                onClick={() =>
                                                    handleVisibility(record)
                                                }
                                            >
                                                {busyId === record.id
                                                    ? 'Updating...'
                                                    : record.is_visible
                                                        ? 'Hide'
                                                        : 'Show'}
                                            </button>
                                        )}

                                        {section === 'events' && (
                                            <select
                                                aria-label={`Event status for ${record.title}`}
                                                value={record.status}
                                                disabled={busyId === record.id}
                                                onChange={(event) =>
                                                    handleEventStatus(
                                                        record,
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="upcoming">
                                                    Upcoming
                                                </option>

                                                <option value="completed">
                                                    Completed
                                                </option>

                                                <option value="cancelled">
                                                    Cancelled
                                                </option>
                                            </select>
                                        )}

                                        {config.updateOrder && (
                                            <>
                                                <input
                                                    aria-label={`Display order for ${record.title}`}
                                                    type="number"
                                                    min="0"
                                                    max="1000000"
                                                    value={
                                                        orderValues[record.id] ?? 0
                                                    }
                                                    onChange={(event) =>
                                                        setOrderValues((current) => ({
                                                            ...current,
                                                            [record.id]: event.target.value,
                                                        }))
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="team-action-button"
                                                    disabled={busyId === record.id}
                                                    onClick={() => handleOrder(record)}
                                                >
                                                    Save order
                                                </button>
                                            </>
                                        )}

                                        <button
                                            type="button"
                                            className="team-action-button"
                                            disabled={busyId === record.id}
                                            onClick={() => handleDelete(record)}
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

/* =========================================================
   ADMIN OPERATIONS ROUTER
========================================================= */

export default function AdminOperationsPage({ section }) {
    if (section === 'media') {
        return <MediaLibraryPage />
    }

    if (section === 'settings') {
        return <SettingsManagementPage />
    }

    if (!modules[section]) {
        return (
            <section className="dashboard-page">
                <div className="dashboard-api-error" role="alert">
                    Unknown administration section: {section}
                </div>
            </section>
        )
    }

    return (
        <RecordManagementPage
            key={section}
            section={section}
        />
    )
}
