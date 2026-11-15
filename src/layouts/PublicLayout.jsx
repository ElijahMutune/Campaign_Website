
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import {
    ArrowUpRight,
    ExternalLink,
    Menu,
    X,
} from 'lucide-react'

import { usePublicShell } from '../hooks/usePublicShell'
import PublicResources from '../components/public/PublicResources'

import './PublicLayout.css'

const fallbackNavigation = [
    { id: 'home', title: 'Home', url: '/' },
    { id: 'top-stories', title: 'Top Stories', url: '#top-stories' },
    { id: 'news', title: 'News', url: '#news' },
    {
        id: 'priorities',
        title: 'Priorities',
        url: '#campaign-priorities',
    },
    { id: 'events', title: 'Events', url: '#events' },
    { id: 'gallery', title: 'Gallery', url: '#campaign-gallery' },
]

function normalizeArray(value) {
    if (Array.isArray(value)) return value
    if (Array.isArray(value?.items)) return value.items
    if (Array.isArray(value?.data)) return value.data
    if (Array.isArray(value?.value)) return value.value

    return []
}

function Brand({ siteName }) {
    return (
        <Link
            to="/"
            className="brand editorial-brand"
            aria-label={`${siteName || 'Matungulu'} campaign homepage`}
        >
            <span className="brand-mark">M</span>

            <span className="brand-name">
                {siteName || 'MATUNGULU'}
                <small>CAMPAIGN</small>
            </span>
        </Link>
    )
}

function PublicLayout() {
    const {
        settings,
        navigation,
        socialLinks,
    } = usePublicShell()

    const [menuOpen, setMenuOpen] = useState(false)

    const receivedNavigation = normalizeArray(navigation)

    const menuItems = receivedNavigation
        .filter(
            (item) =>
                item &&
                typeof item.title === 'string' &&
                item.title.trim() &&
                typeof item.url === 'string' &&
                item.url.trim() &&
                item.is_visible !== false,
        )
        .sort(
            (a, b) =>
                (a.display_order ?? 0) - (b.display_order ?? 0),
        )

    // Use the CMS menu when published records exist.
    // Otherwise, link directly to the available homepage sections.
    const visibleNavigation = menuItems.length > 0
        ? menuItems
        : fallbackNavigation

    const footerSocialLinks = normalizeArray(socialLinks).filter(
        (social) =>
            social &&
            typeof social.url === 'string' &&
            social.url.trim() &&
            typeof social.platform === 'string' &&
            social.platform.trim(),
    )

    const siteName = settings?.site_name || 'MATUNGULU'
    const siteDescription = settings?.site_description || ''
    const contactPhone = settings?.contact_phone || ''
    const contactEmail = settings?.contact_email || ''
    const officeAddress = settings?.office_address || ''

    function handleNavigationClick() {
        setMenuOpen(false)
    }

    return (
        <div className="public-site editorial-public-site">
            <header className="site-header editorial-site-header">
                <div className="site-header-inner editorial-header-inner">
                    <Brand siteName={siteName} />

                    <nav
                        id="public-main-navigation"
                        className={
                            menuOpen
                                ? 'main-navigation editorial-main-navigation is-open'
                                : 'main-navigation editorial-main-navigation'
                        }
                        aria-label="Main navigation"
                    >
                        {visibleNavigation.map((item, index) => {
                            const external = /^https?:\/\//i.test(item.url)

                            return (
                                <a
                                    key={item.id || item.url || index}
                                    href={item.url}
                                    target={external ? '_blank' : undefined}
                                    rel={
                                        external
                                            ? 'noopener noreferrer'
                                            : undefined
                                    }
                                    onClick={handleNavigationClick}
                                >
                                    {item.title}

                                    {external && (
                                        <ExternalLink size={12} />
                                    )}
                                </a>
                            )
                        })}
                    </nav>

                    <div className="editorial-header-actions">
                        <a
                            className="header-contact editorial-contact"
                            href="#contact"
                        >
                            Get in touch
                            <ArrowUpRight size={16} />
                        </a>

                        <button
                            type="button"
                            className="editorial-mobile-toggle"
                            onClick={() => setMenuOpen((current) => !current)}
                            aria-label={
                                menuOpen
                                    ? 'Close navigation'
                                    : 'Open navigation'
                            }
                            aria-expanded={menuOpen}
                            aria-controls="public-main-navigation"
                        >
                            {menuOpen
                                ? <X size={22} />
                                : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            <Outlet />
            <PublicResources />

            <footer className="site-footer editorial-site-footer" id="contact">
                <div className="footer-inner editorial-footer-inner">
                    <Brand siteName={siteName} />

                    <div className="footer-information">
                        {siteDescription && (
                            <p>{siteDescription}</p>
                        )}

                        {officeAddress && (
                            <span>{officeAddress}</span>
                        )}

                        {contactPhone && (
                            <a href={`tel:${contactPhone}`}>
                                {contactPhone}
                            </a>
                        )}

                        {contactEmail && (
                            <a href={`mailto:${contactEmail}`}>
                                {contactEmail}
                            </a>
                        )}
                    </div>

                    {footerSocialLinks.length > 0 && (
                        <div className="footer-social-links">
                            {footerSocialLinks.map((social) => (
                                <a
                                    key={social.id || social.url}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {social.platform}
                                    <ArrowUpRight size={13} />
                                </a>
                            ))}
                        </div>
                    )}

                    <span className="footer-credit">
                        {siteName}
                    </span>
                </div>
            </footer>
        </div>
    )
}

export default PublicLayout
