import { useCallback, useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
    ArrowLeft,
    RefreshCw,
    Plus,
    Save,
    Pencil,
    Trash2,
} from 'lucide-react'
import { adminApi } from '../../services/api'
import MediaPicker from './MediaPicker'
import AdminOperationsPage from '../../pages/admin/AdminOperationsPage'

const modules = {
    candidate: {
        label: 'Candidate profile',
        fields: [
            { name: 'full_name', label: 'Full name', required: true },
            { name: 'position', label: 'Position' },
            { name: 'constituency', label: 'Constituency' },
            { name: 'slogan', label: 'Campaign slogan' },
            {
                name: 'biography',
                label: 'Biography',
                type: 'textarea',
            },
            {
                name: 'profile_media_id',
                label: 'Candidate profile image',
                type: 'media',
            },
        ],
        load: async () => {
            try {
                const profile = await adminApi.getCandidate()
                return profile ? [profile] : []
            } catch (error) {
                if (error.status === 404) return []
                throw error
            }
        },
        save: (_, payload) => adminApi.updateCandidate(payload),
        toggle: (record) =>
            adminApi.publishCandidate({
                is_published: !record.is_published,
            }),
        status: (record) =>
            record.is_published ? 'Published' : 'Draft',
        toggleLabel: (record) =>
            record.is_published ? 'Unpublish' : 'Publish',
        title: (record) => record.full_name,
    },

    headlines: {
        label: 'Headlines',
        fields: [
            { name: 'title', label: 'Headline title', required: true },
            {
                name: 'description',
                label: 'Description',
                type: 'textarea',
            },
            {
                name: 'media_id',
                label: 'Headline image',
                type: 'media',
            },
            { name: 'link_url', label: 'Link URL' },
            {
                name: 'display_order',
                label: 'Display order',
                type: 'number',
            },
        ],
        load: () => adminApi.listHeadlines(),
        save: (id, payload) =>
            id
                ? adminApi.updateHeadline(id, payload)
                : adminApi.createHeadline(payload),
        toggle: (record) =>
            adminApi.updateHeadlineStatus(record.id, {
                is_active: !record.is_active,
            }),
        status: (record) =>
            record.is_active ? 'Active' : 'Inactive',
        toggleLabel: (record) =>
            record.is_active ? 'Deactivate' : 'Activate',
        remove: (id) => adminApi.deleteHeadline(id),
        title: (record) => record.title,
    },

    manifesto: {
        label: 'Manifesto',
        fields: [
            { name: 'title', label: 'Priority title', required: true },
            {
                name: 'description',
                label: 'Description',
                type: 'textarea',
                required: true,
            },
            {
                name: 'media_id',
                label: 'Priority image',
                type: 'media',
            },
            {
                name: 'display_order',
                label: 'Display order',
                type: 'number',
            },
        ],
        load: () => adminApi.listManifesto(),
        save: (id, payload) =>
            id
                ? adminApi.updateManifesto(id, payload)
                : adminApi.createManifesto(payload),
        toggle: (record) =>
            adminApi.updateManifestoStatus(record.id, {
                status: record.status === 'published' ? 'draft' : 'published',
            }),
        status: (record) => record.status,
        toggleLabel: (record) =>
            record.status === 'published' ? 'Return to draft' : 'Publish',
        remove: (id) => adminApi.deleteManifesto(id),
        title: (record) => record.title,
    },

    news: {
        label: 'News articles',
        fields: [
            { name: 'title', label: 'Article title', required: true },
            {
                name: 'content',
                label: 'Article content',
                type: 'textarea',
                required: true,
            },
            {
                name: 'featured_media_id',
                label: 'Featured article image',
                type: 'media',
            },
        ],
        load: () => adminApi.listNews(),
        save: (id, payload) =>
            id
                ? adminApi.updateNews(id, payload)
                : adminApi.createNews(payload),
        toggle: (record) =>
            adminApi.updateNewsStatus(record.id, {
                status: record.status === 'published' ? 'draft' : 'published',
            }),
        status: (record) => record.status,
        toggleLabel: (record) =>
            record.status === 'published' ? 'Return to draft' : 'Publish',
        remove: (id) => adminApi.deleteNews(id),
        title: (record) => record.title,
    },
}

function emptyForm(fields) {
    return Object.fromEntries(
        fields.map((field) => [
            field.name,
            field.type === 'number' ? '0' : '',
        ]),
    )
}

function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState('candidate')
    const [records, setRecords] = useState([])
    const [form, setForm] = useState(
        emptyForm(modules.candidate.fields),
    )

    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [busyId, setBusyId] = useState(null)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const activeModule = modules[activeTab]

    const fetchRecords = useCallback(async () => {
        try {
            const result = await modules[activeTab].load()

            return {
                records: Array.isArray(result) ? result : [],
                error: '',
            }
        } catch (err) {
            return {
                records: [],
                error: err.message || 'Unable to load campaign content.',
            }
        }
    }, [activeTab])

    const loadRecords = async () => {
        setLoading(true)
        setError('')

        const result = await fetchRecords()

        setRecords(result.records)
        setError(result.error)
        setLoading(false)
    }

    useEffect(() => {
        let active = true

        async function initialLoad() {
            const result = await fetchRecords()

            if (!active) return

            setRecords(result.records)
            setError(result.error)
            setLoading(false)
        }

        initialLoad()

        return () => {
            active = false
        }
    }, [fetchRecords])

    const changeModule = (key) => {
        setLoading(true)
        setError('')
        setActiveTab(key)
        setEditingId(null)
        setForm(emptyForm(modules[key].fields))
        setSuccess('')
    }

    const editRecord = (record) => {
        const values = {}

        activeModule.fields.forEach((field) => {
            values[field.name] = record[field.name] ?? (
                field.type === 'number' ? '0' : ''
            )
        })

        setForm(values)
        setEditingId(record.id)
        setError('')
        setSuccess('')
    }

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleSave = async (event) => {
        event.preventDefault()

        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const payload = {}

            activeModule.fields.forEach((field) => {
                const value = form[field.name]

                if (field.type === 'media') {
                    payload[field.name] = value || null
                } else if (field.type === 'number') {
                    payload[field.name] = Number(value || 0)
                } else {
                    const cleaned = String(value || '').trim()

                    payload[field.name] = field.required
                        ? cleaned
                        : cleaned || null
                }
            })

            await activeModule.save(editingId, payload)

            setSuccess(
                `${activeModule.label} ${editingId ? 'updated' : 'saved'} successfully.`,
            )

            setEditingId(null)
            setForm(emptyForm(activeModule.fields))

            await loadRecords()
        } catch (err) {
            setError(err.message || 'Unable to save campaign content.')
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (record) => {
        const action = activeModule.toggleLabel(record)

        if (!window.confirm(`${action} "${activeModule.title(record)}"?`)) {
            return
        }

        setBusyId(record.id)
        setError('')
        setSuccess('')

        try {
            await activeModule.toggle(record)

            setSuccess(
                `${activeModule.title(record)} updated successfully.`,
            )

            await loadRecords()
        } catch (err) {
            setError(
                err.message || 'Unable to update publication status.',
            )
        } finally {
            setBusyId(null)
        }
    }

    const handleDelete = async (record) => {
        if (!activeModule.remove) return

        if (!window.confirm(
            `Permanently delete "${activeModule.title(record)}"?`,
        )) {
            return
        }

        setBusyId(record.id)
        setError('')
        setSuccess('')

        try {
            await activeModule.remove(record.id)

            setSuccess('Record deleted successfully.')

            await loadRecords()
        } catch (err) {
            setError(err.message || 'Unable to delete record.')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <section className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">CONTENT MANAGEMENT</span>
                    <h1>Website content</h1>
                    <p>
                        Manage the information displayed on the public campaign website.
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

            <div className="content-module-tabs">
                {Object.entries(modules).map(([key, item]) => (
                    <button
                        type="button"
                        key={key}
                        className={activeTab === key ? 'active' : ''}
                        onClick={() => changeModule(key)}
                    >
                        {item.label}
                    </button>
                ))}
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
                        {editingId ? 'Update' : 'Create'} {activeModule.label}
                    </h2>

                    <form className="team-form" onSubmit={handleSave}>
                        {activeModule.fields.map((field) => {
                            if (field.type === 'media') {
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
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            required={field.required}
                                            rows={5}
                                        />
                                    ) : (
                                        <input
                                            type={
                                                field.type === 'number'
                                                    ? 'number'
                                                    : 'text'
                                            }
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            required={field.required}
                                            min={
                                                field.type === 'number'
                                                    ? 0
                                                    : undefined
                                            }
                                        />
                                    )}
                                </label>
                            )
                        })}

                        <button
                            type="submit"
                            className="button button-primary"
                            disabled={saving}
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
                                onClick={() => {
                                    setEditingId(null)
                                    setForm(emptyForm(activeModule.fields))
                                }}
                            >
                                Cancel editing
                            </button>
                        )}
                    </form>
                </div>

                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <span className="eyebrow">DATABASE RECORDS</span>
                        <Plus size={19} />
                    </div>

                    <h2>{activeModule.label}</h2>

                    {loading ? (
                        <div className="content-state">
                            Loading records...
                        </div>
                    ) : records.length === 0 ? (
                        <div className="content-state">
                            No records found. Create the first record using the form.
                        </div>
                    ) : (
                        <div className="content-record-list">
                            {records.map((record) => (
                                <article
                                    className="content-record"
                                    key={record.id}
                                >
                                    <div>
                                        <strong>
                                            {activeModule.title(record)}
                                        </strong>

                                        <small>
                                            {activeModule.status(record)}
                                        </small>

                                        <p>
                                            {record.description ||
                                                record.content ||
                                                record.slogan ||
                                                ''}
                                        </p>

                                        {(
                                            record.profile_media_id ||
                                            record.featured_media_id ||
                                            record.media_id
                                        ) && (
                                            <small>Image attached</small>
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

                                        <button
                                            type="button"
                                            className="team-action-button"
                                            onClick={() => handleToggle(record)}
                                            disabled={busyId === record.id}
                                        >
                                            {busyId === record.id
                                                ? 'Updating...'
                                                : activeModule.toggleLabel(record)}
                                        </button>

                                        {activeModule.remove && (
                                            <button
                                                type="button"
                                                className="team-action-button"
                                                onClick={() => handleDelete(record)}
                                                disabled={busyId === record.id}
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        )}
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

const sectionNames = {
    media: 'Media library',
    events: 'Campaign events',
    documents: 'Documents',
    messages: 'Messages',
    team: 'Team and editors',
    settings: 'Workspace settings',
    tasks: 'Field tasks',
    areas: 'Assigned areas',
    reports: 'Field reports',
    announcements: 'Announcements',
}

function PortalSectionPage({ portal }) {
    const location = useLocation()
    const section = location.pathname.split('/').filter(Boolean).at(-1)

    if (section === 'content') {
        return <ContentManagementPage />
    }

    if (
        [
            'events',
            'documents',
            'posters',
            'media',
            'navigation',
            'settings',
        ].includes(section)
    ) {
        return <AdminOperationsPage section={section} />
    }

    const title = sectionNames[section] || 'Workspace section'

    return (
        <section className="portal-section-page">
            <Link
                to={portal === 'admin' ? '/admin' : '/agent'}
                className="back-link"
            >
                <ArrowLeft size={16} />
                Back to overview
            </Link>

            <span className="eyebrow">
                {portal === 'admin' ? 'ADMINISTRATION' : 'FIELD WORKSPACE'}
            </span>

            <h1>{title}</h1>

            <p>
                This section has not yet been connected to its management interface.
            </p>
        </section>
    )
}

export default PortalSectionPage