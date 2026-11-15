
const API_BASE_URL = (
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'
).replace(/\/+$/, '')

const TOKEN_KEY = 'matungulu_campaign_access_token'

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

async function request(path, options = {}) {
    const {
        method = 'GET',
        body,
        authenticated = true,
    } = options

    const headers = new Headers()
    const isFormData = body instanceof FormData

    if (body !== undefined && !isFormData) {
        headers.set('Content-Type', 'application/json')
    }

    const token = authenticated
        ? sessionStorage.getItem(TOKEN_KEY)
        : null

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    let response

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body === undefined
                ? undefined
                : isFormData
                    ? body
                    : JSON.stringify(body),
        })
    } catch {
        throw new ApiError(
            'Unable to reach the backend. Check that the Rust server is running.'
        )
    }

    if (response.status === 401 && authenticated) {
        sessionStorage.removeItem(TOKEN_KEY)
        window.dispatchEvent(new Event('auth:unauthorized'))
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new ApiError(
            data?.message || `Request failed with status ${response.status}.`,
            response.status
        )
    }

    return data
}
async function requestBlob(path) {
    const headers = new Headers()
    const token = sessionStorage.getItem(TOKEN_KEY)

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    let response

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'GET',
            headers,
        })
    } catch {
        throw new ApiError(
            'Unable to reach the backend. Check that the Rust server is running.'
        )
    }

    if (response.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY)
        window.dispatchEvent(new Event('auth:unauthorized'))
    }

    if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new ApiError(
            data?.message || `Request failed with status ${response.status}.`,
            response.status
        )
    }

    return response.blob()
}

// ======================================================
// AUTHENTICATION API
// ======================================================

export const authApi = {
    login(credentials) {
        return request('/auth/login', {
            method: 'POST',
            body: credentials,
            authenticated: false,
        })
    },

    me() {
        return request('/auth/me')
    },

    changePassword(credentials) {
        return request('/auth/change-password', {
            method: 'POST',
            body: credentials,
        })
    },

    setToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token)
    },

    getToken() {
        return sessionStorage.getItem(TOKEN_KEY)
    },

    clearToken() {
        sessionStorage.removeItem(TOKEN_KEY)
    },
}

// ======================================================
// PUBLIC WEBSITE API
// ======================================================

export const publicApi = {
    // Candidate
    getCandidate: () =>
        request('/public/candidate', { authenticated: false }),

    // Headlines
    getHeadlines: () =>
        request('/public/headlines', { authenticated: false }),

    // Manifesto
    getManifesto: () =>
        request('/public/manifesto', { authenticated: false }),

    // News
    getNews: () =>
        request('/public/news', { authenticated: false }),

    getNewsArticle: (slug) =>
        request(`/public/news/${encodeURIComponent(slug)}`, {
            authenticated: false,
        }),

    // Campaign events
    getEvents: (period = 'upcoming') =>
        request(`/public/events?period=${encodeURIComponent(period)}`, {
            authenticated: false,
        }),

    getEvent: (id) =>
        request(`/public/events/${encodeURIComponent(id)}`, {
            authenticated: false,
        }),

    // Campaign schedule
    getCampaignSchedule: (period = 'upcoming') =>
        request(`/public/campaign-schedule?period=${encodeURIComponent(period)}`, {
            authenticated: false,
        }),

    getScheduleEntry: (id) =>
        request(`/public/campaign-schedule/${encodeURIComponent(id)}`, {
            authenticated: false,
        }),

    // Navigation
    getNavigation: () =>
        request('/public/navigation', { authenticated: false }),

    // Website settings
    getSettings: () =>
        request('/public/settings', { authenticated: false }),

    // Social links
    getSocialLinks: () =>
        request('/public/social-links', { authenticated: false }),

    // Documents
    getDocuments: () =>
        request('/public/documents', { authenticated: false }),

    getDocument: (id) =>
        request(`/public/documents/${encodeURIComponent(id)}`, {
            authenticated: false,
        }),

    getDocumentDownloadUrl: (id) =>
        `${API_BASE_URL}/public/documents/${encodeURIComponent(id)}/download`,

    // Posters
    getPosters: () =>
        request('/public/posters', { authenticated: false }),

    getPoster: (id) =>
        request(`/public/posters/${encodeURIComponent(id)}`, {
            authenticated: false,
        }),

    getPosterPreviewUrl: (id) =>
        `${API_BASE_URL}/public/posters/${encodeURIComponent(id)}/preview`,

    getPublicMediaFileUrl: (mediaId) =>
        `${API_BASE_URL}/public/media/${encodeURIComponent(mediaId)}/file`,

    getPosterDownloadUrl: (id) =>
        `${API_BASE_URL}/public/posters/${encodeURIComponent(id)}/download`,

    // Talent
    getTalentCategories: () =>
        request('/public/talent/categories', { authenticated: false }),

    getTalentShowcase: () =>
        request('/public/talent-showcase', { authenticated: false }),

    getTalentApplication: (id) =>
        request(`/public/talent-showcase/${encodeURIComponent(id)}`, {
            authenticated: false,
        }),

    submitTalentApplication: (payload) =>
        request('/public/talent/applications', {
            method: 'POST',
            body: payload,
            authenticated: false,
        }),

    // Contact
    submitContactMessage: (payload) =>
        request('/public/contact-messages', {
            method: 'POST',
            body: payload,
            authenticated: false,
        }),
}

// ======================================================
// MEDIA API
// ======================================================


export const mediaApi = {
    // List media with pagination and optional search.
    listMedia: ({ page = 1, per_page = 20, search = '' } = {}) => {
        const params = new URLSearchParams({
            page: String(page),
            per_page: String(per_page),
        })

        if (search.trim()) {
            params.set('search', search.trim())
        }

        return request(`/media/list?${params}`)
    },
    getMediaFile: (mediaId) =>
        requestBlob(`/media/${encodeURIComponent(mediaId)}/file`),

    // Upload an image.
    // Required multipart field: file
    // Optional fields: alt_text, caption
    uploadImage: (formData) =>
        request('/media/upload', {
            method: 'POST',
            body: formData,
        }),

    // List albums.
    listAlbums: () =>
        request('/media/albums'),

    // Create an album.
    // New albums are private drafts by default.
    createAlbum: (payload) =>
        request('/media/albums', {
            method: 'POST',
            body: payload,
        }),

    // Retrieve an album and its associated images.
    getAlbum: (albumId) =>
        request(`/media/albums/${encodeURIComponent(albumId)}`),

    // Update album details and publication status.
    updateAlbum: (albumId, payload) =>
        request(`/media/albums/${encodeURIComponent(albumId)}`, {
            method: 'PUT',
            body: payload,
        }),


    // Add an existing image to an album.
    // No request body is accepted by this backend handler.
    addMediaToAlbum: (albumId, mediaId) =>
        request(
            `/media/albums/${encodeURIComponent(albumId)}/media/${encodeURIComponent(mediaId)}`,
            {
                method: 'POST',
            }
        ),

    // Remove an image from an album.
    // This does NOT delete the original media file.
    removeMediaFromAlbum: (albumId, mediaId) =>
        request(
            `/media/albums/${encodeURIComponent(albumId)}/media/${encodeURIComponent(mediaId)}`,
            {
                method: 'DELETE',
            }
        ),
}


// ======================================================
// ADMIN API
// ======================================================

export const adminApi = {
    // Dashboard and team
    getStatus: () =>
        request('/admin/status'),

    listEditors: () =>
        request('/admin/users/editors'),

    createEditor: (payload) =>
        request('/admin/users/editors', {
            method: 'POST',
            body: payload,
        }),

    updateEditorStatus: (id, payload) =>
        request(`/admin/users/editors/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: payload,
        }),

    // Website settings
    getSiteSettings: () =>
        request('/admin/settings'),

    updateSiteSettings: (payload) =>
        request('/admin/settings', {
            method: 'PUT',
            body: payload,
        }),

    // Candidate profile
    getCandidate: () =>
        request('/admin/candidate'),

    updateCandidate: (payload) =>
        request('/admin/candidate', {
            method: 'PUT',
            body: payload,
        }),

    publishCandidate: (payload) =>
        request('/admin/candidate/publish', {
            method: 'PATCH',
            body: payload,
        }),

    // Headlines
    listHeadlines: () =>
        request('/admin/headlines'),

    getHeadline: (id) =>
        request(`/admin/headlines/${encodeURIComponent(id)}`),

    createHeadline: (payload) =>
        request('/admin/headlines', {
            method: 'POST',
            body: payload,
        }),

    updateHeadline: (id, payload) =>
        request(`/admin/headlines/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updateHeadlineStatus: (id, payload) =>
        request(`/admin/headlines/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteHeadline: (id) =>
        request(`/admin/headlines/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Manifesto
    listManifesto: () =>
        request('/admin/manifesto'),

    getManifesto: (id) =>
        request(`/admin/manifesto/${encodeURIComponent(id)}`),

    createManifesto: (payload) =>
        request('/admin/manifesto', {
            method: 'POST',
            body: payload,
        }),

    updateManifesto: (id, payload) =>
        request(`/admin/manifesto/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updateManifestoStatus: (id, payload) =>
        request(`/admin/manifesto/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteManifesto: (id) =>
        request(`/admin/manifesto/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // News
    listNews: () =>
        request('/admin/news'),

    getNews: (id) =>
        request(`/admin/news/${encodeURIComponent(id)}`),

    createNews: (payload) =>
        request('/admin/news', {
            method: 'POST',
            body: payload,
        }),

    updateNews: (id, payload) =>
        request(`/admin/news/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updateNewsStatus: (id, payload) =>
        request(`/admin/news/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteNews: (id) =>
        request(`/admin/news/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Campaign events
    listEvents: () =>
        request('/admin/events'),

    getEvent: (id) =>
        request(`/admin/events/${encodeURIComponent(id)}`),

    createEvent: (payload) =>
        request('/admin/events', {
            method: 'POST',
            body: payload,
        }),

    updateEvent: (id, payload) =>
        request(`/admin/events/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updateEventStatus: (id, payload) =>
        request(`/admin/events/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: payload,
        }),

    updateEventPublication: (id, payload) =>
        request(`/admin/events/${encodeURIComponent(id)}/publish`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteEvent: (id) =>
        request(`/admin/events/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Campaign schedule
    listSchedule: () =>
        request('/admin/campaign-schedule'),

    getSchedule: (id) =>
        request(`/admin/campaign-schedule/${encodeURIComponent(id)}`),

    createSchedule: (payload) =>
        request('/admin/campaign-schedule', {
            method: 'POST',
            body: payload,
        }),

    updateSchedule: (id, payload) =>
        request(`/admin/campaign-schedule/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updateScheduleStatus: (id, payload) =>
        request(`/admin/campaign-schedule/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: payload,
        }),

    updateSchedulePublication: (id, payload) =>
        request(`/admin/campaign-schedule/${encodeURIComponent(id)}/publish`, {
            method: 'PATCH',
            body: payload,
        }),

    updateScheduleOrder: (id, payload) =>
        request(`/admin/campaign-schedule/${encodeURIComponent(id)}/order`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteSchedule: (id) =>
        request(`/admin/campaign-schedule/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Posters
    listPosters: () =>
        request('/admin/posters'),

    getPoster: (id) =>
        request(`/admin/posters/${encodeURIComponent(id)}`),

    createPoster: (payload) =>
        request('/admin/posters', {
            method: 'POST',
            body: payload,
        }),

    updatePoster: (id, payload) =>
        request(`/admin/posters/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updatePosterPublication: (id, payload) =>
        request(`/admin/posters/${encodeURIComponent(id)}/publish`, {
            method: 'PATCH',
            body: payload,
        }),

    updatePosterOrder: (id, payload) =>
        request(`/admin/posters/${encodeURIComponent(id)}/order`, {
            method: 'PATCH',
            body: payload,
        }),

    deletePoster: (id) =>
        request(`/admin/posters/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Poster categories
    listPosterCategories: () =>
        request('/admin/poster-categories'),

    getPosterCategory: (id) =>
        request(`/admin/poster-categories/${encodeURIComponent(id)}`),

    createPosterCategory: (payload) =>
        request('/admin/poster-categories', {
            method: 'POST',
            body: payload,
        }),

    updatePosterCategory: (id, payload) =>
        request(`/admin/poster-categories/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    deletePosterCategory: (id) =>
        request(`/admin/poster-categories/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Talent categories
    listTalentCategories: () =>
        request('/admin/talent/categories'),

    createTalentCategory: (payload) =>
        request('/admin/talent/categories', {
            method: 'POST',
            body: payload,
        }),

    updateTalentCategory: (id, payload) =>
        request(`/admin/talent/categories/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    deleteTalentCategory: (id) =>
        request(`/admin/talent/categories/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Talent applications
    listTalentApplications: () =>
        request('/admin/talent/applications'),

    getTalentApplication: (id) =>
        request(`/admin/talent/applications/${encodeURIComponent(id)}`),

    reviewTalentApplication: (id, payload) =>
        request(`/admin/talent/applications/${encodeURIComponent(id)}/review`, {
            method: 'PATCH',
            body: payload,
        }),

    publishTalentApplication: (id, payload) =>
        request(`/admin/talent/applications/${encodeURIComponent(id)}/publish`, {
            method: 'PATCH',
            body: payload,
        }),

    // Talent attachments
    listTalentAttachments: (id) =>
        request(`/admin/talent/applications/${encodeURIComponent(id)}/attachments`),

    addTalentAttachment: (id, payload) =>
        request(`/admin/talent/applications/${encodeURIComponent(id)}/attachments`, {
            method: 'POST',
            body: payload,
        }),

    removeTalentAttachment: (id, mediaId) =>
        request(
            `/admin/talent/applications/${encodeURIComponent(id)}/attachments/${encodeURIComponent(mediaId)}`,
            {
                method: 'DELETE',
            }
        ),

    // Navigation
    listNavigation: () =>
        request('/admin/navigation'),

    getNavigation: (id) =>
        request(`/admin/navigation/${encodeURIComponent(id)}`),

    createNavigation: (payload) =>
        request('/admin/navigation', {
            method: 'POST',
            body: payload,
        }),

    updateNavigation: (id, payload) =>
        request(`/admin/navigation/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updateNavigationVisibility: (id, payload) =>
        request(`/admin/navigation/${encodeURIComponent(id)}/visibility`, {
            method: 'PATCH',
            body: payload,
        }),

    updateNavigationOrder: (id, payload) =>
        request(`/admin/navigation/${encodeURIComponent(id)}/order`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteNavigation: (id) =>
        request(`/admin/navigation/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Documents
    listDocuments: () =>
        request('/admin/documents'),

    getDocument: (id) =>
        request(`/admin/documents/${encodeURIComponent(id)}`),

    createDocument: (payload) =>
        request('/admin/documents', {
            method: 'POST',
            body: payload,
        }),

    updateDocument: (id, payload) =>
        request(`/admin/documents/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    uploadDocument: (formData) =>
        request('/admin/documents/upload', {
            method: 'POST',
            body: formData,
        }),

    updateDocumentPublication: (id, payload) =>
        request(`/admin/documents/${encodeURIComponent(id)}/publish`, {
            method: 'PATCH',
            body: payload,
        }),

    updateDocumentOrder: (id, payload) =>
        request(`/admin/documents/${encodeURIComponent(id)}/order`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteDocument: (id) =>
        request(`/admin/documents/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Social links
    listSocialLinks: () =>
        request('/admin/social-links'),

    getSocialLink: (id) =>
        request(`/admin/social-links/${encodeURIComponent(id)}`),

    createSocialLink: (payload) =>
        request('/admin/social-links', {
            method: 'POST',
            body: payload,
        }),

    updateSocialLink: (id, payload) =>
        request(`/admin/social-links/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: payload,
        }),

    updateSocialVisibility: (id, payload) =>
        request(`/admin/social-links/${encodeURIComponent(id)}/visibility`, {
            method: 'PATCH',
            body: payload,
        }),

    updateSocialOrder: (id, payload) =>
        request(`/admin/social-links/${encodeURIComponent(id)}/order`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteSocialLink: (id) =>
        request(`/admin/social-links/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),

    // Contact messages
    listContactMessages: () =>
        request('/admin/contact-messages'),

    getContactMessage: (id) =>
        request(`/admin/contact-messages/${encodeURIComponent(id)}`),

    updateContactMessage: (id, payload) =>
        request(`/admin/contact-messages/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: payload,
        }),

    deleteContactMessage: (id) =>
        request(`/admin/contact-messages/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }),
}
