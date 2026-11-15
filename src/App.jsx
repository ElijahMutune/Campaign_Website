import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'

import HomePage from './pages/public/HomePage'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeamManagementPage from './pages/admin/TeamManagementPage'

import LoginPage from './pages/auth/LoginPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'

import PortalSectionPage from './components/common/PortalSectionPage'
import {
    ProtectedRoute,
    PublicOnly,
} from './components/common/ProtectedRoute'

import './App.css'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                </Route>

                <Route
                    path="/login"
                    element={
                        <PublicOnly>
                            <LoginPage />
                        </PublicOnly>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute allowPasswordChange>
                            <ChangePasswordPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'mp', 'editor']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />

                    <Route
                        path="team"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'mp']}>
                                <TeamManagementPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<PortalSectionPage portal="admin" />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
