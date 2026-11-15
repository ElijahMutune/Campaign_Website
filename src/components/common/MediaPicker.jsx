import { useCallback, useEffect, useRef, useState } from 'react'
import {
    RefreshCw,
    Upload,
    X,
} from 'lucide-react'
import { mediaApi } from '../../services/api'
import './MediaPicker.css'

const MAX_FILE_SIZE = 8 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
]

function isImageMedia(media) {
    return (
        media?.media_type === 'image' ||
        ALLOWED_IMAGE_TYPES.includes(media?.mime_type)
    )
}

export default function MediaPicker({
    label = 'Select image',
    value = '',
    onChange,
    disabled = false,
    required = false,
}) {
    const [items, setItems] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    const [error, setError] = useState('')
    const [preview, setPreview] = useState(null)

    const fileInputRef = useRef(null)

    // Fetch image records without changing component state.
    const fetchMedia = useCallback(async (searchTerm = '') => {
        const result = await mediaApi.listMedia({
            page: 1,
            per_page: 100,
            search: searchTerm,
        })

        const records = Array.isArray(result?.items)
            ? result.items
            : []

        return records.filter(isImageMedia)
    }, [])

    // Initial media loading.
    useEffect(() => {
        let active = true

        async function initialLoad() {
            try {
                const records = await fetchMedia()

                if (active) {
                    setItems(records)
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.message ||
                        'Unable to load images from the media library.',
                    )
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        initialLoad()

        return () => {
            active = false
        }
    }, [fetchMedia])

    // Load the preview associated with the selected media ID.
    useEffect(() => {
        if (!value) return undefined

        let active = true
        let objectUrl = ''

        async function loadPreview() {
            try {
                const blob = await mediaApi.getMediaFile(value)

                if (!active) return

                objectUrl = URL.createObjectURL(blob)

                setPreview({
                    mediaId: value,
                    url: objectUrl,
                    error: false,
                })
            } catch {
                if (active) {
                    setPreview({
                        mediaId: value,
                        url: '',
                        error: true,
                    })
                }
            }
        }

        loadPreview()

        return () => {
            active = false

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [value])

    // Only display a preview belonging to the currently selected ID.
    const activePreview =
        value && preview?.mediaId === value
            ? preview
            : null

    const selectedItem = items.find(
        (item) => item.id === value,
    )

    const selectedItemMissing =
        Boolean(value) && !selectedItem

    // Manual refresh and search.
    const refreshMedia = async (searchTerm = '') => {
        setLoading(true)
        setError('')

        try {
            const records = await fetchMedia(searchTerm)
            setItems(records)
        } catch (err) {
            setError(
                err.message ||
                'Unable to load images from the media library.',
            )
        } finally {
            setLoading(false)
        }
    }

    // Upload an image and immediately select the returned media ID.
    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0]

        if (!file) {
            setError('Please select an image to upload.')
            return
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError('Only JPEG, PNG and WebP images are accepted.')
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('The selected image exceeds the 8 MB upload limit.')
            return
        }

        setUploading(true)
        setError('')

        try {
            const data = new FormData()

            data.append('file', file)

            const result = await mediaApi.uploadImage(data)

            const uploadedMedia =
                result?.media ||
                result?.data?.media ||
                result?.data ||
                result

            if (!uploadedMedia?.id) {
                throw new Error(
                    'The server did not return the uploaded image media ID.',
                )
            }

            setItems((current) => [
                uploadedMedia,
                ...current.filter(
                    (item) => item.id !== uploadedMedia.id,
                ),
            ])

            onChange?.(uploadedMedia.id)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

        } catch (err) {
            setError(
                err.message || 'Unable to upload the image.',
            )
        } finally {
            setUploading(false)
        }
    }

    const handleClear = () => {
        onChange?.('')
        setError('')
    }

    return (
        <div className="media-picker">
            <div className="media-picker-heading">
                <span>{label}</span>

                {value && (
                    <button
                        type="button"
                        className="media-picker-clear"
                        onClick={handleClear}
                        disabled={disabled || uploading}
                    >
                        <X size={14} />
                        Remove selection
                    </button>
                )}
            </div>

            <div className="media-picker-selection">
                <select
                    value={value || ''}
                    required={required}
                    disabled={disabled || loading}
                    onChange={(event) =>
                        onChange?.(event.target.value)
                    }
                >
                    <option value="">Choose an image</option>

                    {selectedItemMissing && (
                        <option value={value}>
                            Previously selected image
                        </option>
                    )}

                    {items.map((item) => (
                        <option
                            key={item.id}
                            value={item.id}
                        >
                            {item.original_filename || item.id}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="media-picker-refresh"
                    onClick={() => refreshMedia(search.trim())}
                    disabled={disabled || loading || uploading}
                    title="Refresh media library"
                >
                    <RefreshCw
                        size={15}
                        className={
                            loading
                                ? 'media-picker-spinning'
                                : ''
                        }
                    />
                </button>
            </div>

            <div className="media-picker-search">
                <input
                    type="search"
                    value={search}
                    placeholder="Search uploaded images"
                    disabled={disabled || loading || uploading}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault()
                            refreshMedia(search.trim())
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={() => refreshMedia(search.trim())}
                    disabled={disabled || loading || uploading}
                >
                    Search
                </button>
            </div>

            {loading && (
                <p className="media-picker-message">
                    Loading media library...
                </p>
            )}

            {!loading && items.length === 0 && !error && (
                <p className="media-picker-message">
                    No images found. Upload an image or check the Media Library.
                </p>
            )}

            {value && (
                <div className="media-picker-preview">
                    {activePreview?.url ? (
                        <img
                            src={activePreview.url}
                            alt={
                                selectedItem?.alt_text ||
                                selectedItem?.original_filename ||
                                'Selected campaign image'
                            }
                        />
                    ) : activePreview?.error ? (
                        <span>
                            Preview unavailable. The selected media ID is retained.
                        </span>
                    ) : (
                        <span>Loading image preview...</span>
                    )}

                    {selectedItem && (
                        <small>
                            {selectedItem.original_filename}
                        </small>
                    )}
                </div>
            )}

            <div className="media-picker-upload">
                <label>
                    Upload a new image

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={disabled || uploading}
                    />
                </label>

                <button
                    type="button"
                    className="media-picker-upload-button"
                    onClick={handleUpload}
                    disabled={disabled || uploading}
                >
                    <Upload size={15} />

                    {uploading
                        ? 'Uploading...'
                        : 'Upload and select'}
                </button>
            </div>

            <p className="media-picker-hint">
                JPEG, PNG or WebP. Maximum file size: 8 MB.
            </p>

            {error && (
                <p className="media-picker-error" role="alert">
                    {error}
                </p>
            )}

            {value && (
                <small className="media-picker-id">
                    Media ID: {value}
                </small>
            )}
        </div>
    )
}