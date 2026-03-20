import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'

import { LandingPage }           from '@/pages/LandingPage'
import { ShopPage }              from '@/pages/shop/ShopPage'
import { ProductPage }           from '@/pages/shop/ProductPage'
import { ServicesPage }          from '@/pages/ServicesPage'
import { CheckoutPage }          from '@/pages/shop/CheckoutPage'
import { LoginPage }             from '@/pages/auth/LoginPage'
import { AccountPage }           from '@/pages/account/AccountPage'
import { AdminLoginPage }        from '@/pages/auth/AdminLoginPage'
import { DashboardOverview }     from '@/pages/dashboard/DashboardOverview'
import { DashboardProducts }     from '@/pages/dashboard/DashboardProducts'
import { ProductEditor }         from '@/pages/dashboard/ProductEditor'
import { DashboardOrders }       from '@/pages/dashboard/DashboardOrders'
import { DashboardCosmosEditor } from '@/pages/dashboard/DashboardCosmosEditor'
import { DashboardSiteSettings } from '@/pages/dashboard/DashboardSiteSettings'
import { PrivacyPage }           from '@/pages/legal/PrivacyPage'
import { TermsPage }             from '@/pages/legal/TermsPage'
import { ReturnsPage }           from '@/pages/legal/ReturnsPage'
import { ContactPage }           from '@/pages/ContactPage'

// Unauthenticated users trying to reach /dashboard are sent to the hidden admin login.
// Non-admin authenticated users are sent home.
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/rbx-portal" replace />
  if (!isAdmin)         return <Navigate to="/" replace />
  return <>{children}</>
}

// Checkout requires a logged-in account (any role)
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

// Redirect already-signed-in users away from the public login page
function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { init } = useAuthStore()
  const { validateCart } = useCartStore()
  useEffect(() => { const unsub = init(); return unsub }, [init])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/shop"          element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/services"      element={<ServicesPage />} />
        <Route path="/checkout"      element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="/privacy"       element={<PrivacyPage />} />
        <Route path="/terms"         element={<TermsPage />} />
        <Route path="/returns"       element={<ReturnsPage />} />
        <Route path="/contact"       element={<ContactPage />} />

        {/* Legacy shop URLs */}
        <Route path="/keyboards"        element={<Navigate to="/shop" replace />} />
        <Route path="/shop/accessories" element={<Navigate to="/shop" replace />} />
        <Route path="/shop/barebones"   element={<Navigate to="/shop" replace />} />

        {/* User auth — Google only */}
        <Route path="/auth/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/account"      element={<RequireAuth><AccountPage /></RequireAuth>} />

        {/* Hidden admin login — not linked anywhere */}
        <Route path="/rbx-portal" element={<AdminLoginPage />} />

        {/* Admin dashboard */}
        <Route path="/dashboard"                   element={<RequireAdmin><DashboardOverview /></RequireAdmin>} />
        <Route path="/dashboard/products"          element={<RequireAdmin><DashboardProducts /></RequireAdmin>} />
        <Route path="/dashboard/products/new"      element={<RequireAdmin><ProductEditor /></RequireAdmin>} />
        <Route path="/dashboard/products/:id"      element={<RequireAdmin><ProductEditor /></RequireAdmin>} />
        <Route path="/dashboard/orders"            element={<RequireAdmin><DashboardOrders /></RequireAdmin>} />
        <Route path="/dashboard/keyboard-models"   element={<RequireAdmin><DashboardCosmosEditor /></RequireAdmin>} />
        <Route path="/dashboard/settings"          element={<RequireAdmin><DashboardSiteSettings /></RequireAdmin>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
