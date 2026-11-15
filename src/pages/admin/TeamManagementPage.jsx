
import { useCallback, useEffect, useState } from 'react'
import {
    UserPlus,
    Users,
    RefreshCw,
    ShieldCheck,
    UserCheck,
    UserX,
} from 'lucide-react'
import { adminApi } from '../../services/api'

const createEmptyForm = () => ({
    full_name: '',
    username: '',
    email: '',
    password: '',
})

function getErrorMessage(error, fallback) {
    return error instanceof Error && error.message
        ? error.message
        : fallback
}

function TeamManagementPage() {
    const [editors, setEditors] = useState([])
    const [form, setForm] = useState(createEmptyForm)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [updatingId, setUpdatingId] = useState(null)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Retrieve editor records from the backend.
    const fetchEditors = useCallback(async () => {
        const data = await adminApi.listEditors()

        if (!Array.isArray(data)) {
            throw new Error(
                'The editor API returned an unexpected response.'
            )
        }

        return data
    }, [])

    // Initial backend loading.
    useEffect(() => {
        let active = true

        const initialLoad = async () => {
            try {
                const data = await fetchEditors()

                if (!active) return

                setEditors(data)
                setError('')
            } catch (err) {
                if (!active) return

                setError(
                    getErrorMessage(
                        err,
                        'Unable to load editor accounts.'
                    )
                )
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        void initialLoad()

        return () => {
            active = false
        }
    }, [fetchEditors])

    // Refresh editor records from the backend.
    const loadEditors = async () => {
        setLoading(true)
        setError('')

        try {
            const data = await fetchEditors()
            setEditors(data)
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    'Unable to load editor accounts.'
                )
            )
        } finally {
            setLoading(false)
        }
    }

    // Handle all form field changes.
    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    // Create an editor using the backend API.
    const handleCreate = async (event) => {
        event.preventDefault()

        if (submitting) return

        setError('')
        setSuccess('')
        setSubmitting(true)

        try {
            const payload = {
                full_name: form.full_name.trim(),
                username: form.username.trim(),
                email: form.email.trim() || null,
                password: form.password,
            }

            await adminApi.createEditor(payload)

            setForm(createEmptyForm())
            setSuccess('Editor account created successfully.')

            await loadEditors()
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    'Unable to create editor account.'
                )
            )
        } finally {
            setSubmitting(false)
        }
    }

    // Activate or deactivate an editor through the backend.
    const handleStatusChange = async (editor) => {
        if (!editor?.id || updatingId !== null) return

        const nextStatus = !editor.is_active

        const confirmed = window.confirm(
            `${nextStatus ? 'Activate' : 'Deactivate'} ${editor.full_name}'s account?`
        )

        if (!confirmed) return

        setError('')
        setSuccess('')
        setUpdatingId(editor.id)

        try {
            await adminApi.updateEditorStatus(editor.id, {
                is_active: nextStatus,
            })

            setSuccess(
                `${editor.full_name}'s account has been ${
                    nextStatus ? 'activated' : 'deactivated'
                }.`
            )

            // Reload the authoritative account state from the backend.
            await loadEditors()
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    'Unable to update editor account.'
                )
            )
        } finally {
            setUpdatingId(null)
        }
    }

    const activeCount = editors.filter(
        (editor) => editor.is_active === true
    ).length

    const inactiveCount = editors.length - activeCount

    return (
        <section className="dashboard-page team-page">
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">
                        WORKSPACE ADMINISTRATION
                    </span>

                    <h1>Team management</h1>

                    <p>
                        Create and manage accounts for campaign editors.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-refresh"
                    onClick={loadEditors}
                    disabled={loading}
                >
                    <RefreshCw size={15} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div
                    className="dashboard-api-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    className="team-success"
                    role="status"
                >
                    {success}
                </div>
            )}

            <div className="team-summary-grid">
                <div className="team-summary-card">
                    <Users size={20} />

                    <span>Total editors</span>

                    <strong>{editors.length}</strong>
                </div>

                <div className="team-summary-card">
                    <UserCheck size={20} />

                    <span>Active accounts</span>

                    <strong>{activeCount}</strong>
                </div>

                <div className="team-summary-card">
                    <UserX size={20} />

                    <span>Inactive accounts</span>

                    <strong>{inactiveCount}</strong>
                </div>
            </div>

            <div className="team-layout">
                <div className="dashboard-panel team-form-panel">
                    <div className="panel-heading">
                        <span className="eyebrow">
                            NEW ACCOUNT
                        </span>

                        <UserPlus size={20} />
                    </div>

                    <h2>Create editor</h2>

                    <p>
                        Add a team member who can access the campaign workspace.
                    </p>

                    <form
                        className="team-form"
                        onSubmit={handleCreate}
                    >
                        <label>
                            Full name

                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                maxLength={150}
                                autoComplete="name"
                                required
                            />
                        </label>

                        <label>
                            Username

                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                minLength={3}
                                maxLength={50}
                                pattern="[A-Za-z0-9_.-]+"
                                autoComplete="username"
                                required
                            />
                        </label>

                        <label>
                            Email address <span>(optional)</span>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                maxLength={255}
                                autoComplete="email"
                            />
                        </label>

                        <label>
                            Temporary password

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter temporary password"
                                minLength={12}
                                maxLength={128}
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="button button-primary team-submit"
                            disabled={submitting}
                        >
                            <UserPlus size={16} />

                            {submitting
                                ? 'Creating account...'
                                : 'Create editor account'}
                        </button>
                    </form>
                </div>

                <div className="dashboard-panel team-list-panel">
                    <div className="panel-heading">
                        <span className="eyebrow">
                            CAMPAIGN TEAM
                        </span>

                        <ShieldCheck size={20} />
                    </div>

                    <h2>Editor accounts</h2>

                    <p>
                        Review account details and manage access.
                    </p>

                    {loading ? (
                        <div className="content-state">
                            Loading editor accounts...
                        </div>
                    ) : editors.length === 0 ? (
                        <div className="content-state">
                            No editor accounts have been created yet.
                        </div>
                    ) : (
                        <div className="team-table-wrapper">
                            <table className="team-table">
                                <thead>
                                <tr>
                                    <th>EDITOR</th>
                                    <th>USERNAME</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                                </thead>

                                <tbody>
                                {editors.map((editor) => (
                                    <tr key={editor.id}>
                                        <td>
                                            <strong>
                                                {editor.full_name}
                                            </strong>

                                            <small>
                                                {editor.email || 'No email provided'}
                                            </small>
                                        </td>

                                        <td>
                                            @{editor.username}
                                        </td>

                                        <td>
                                                <span
                                                    className={`team-status ${
                                                        editor.is_active
                                                            ? 'active'
                                                            : 'inactive'
                                                    }`}
                                                >
                                                    {editor.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="team-action-button"
                                                disabled={
                                                    updatingId !== null
                                                }
                                                onClick={() =>
                                                    handleStatusChange(editor)
                                                }
                                            >
                                                {updatingId === editor.id
                                                    ? 'Updating...'
                                                    : editor.is_active
                                                        ? 'Deactivate'
                                                        : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default TeamManagementPage
