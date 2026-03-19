import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'

export function AdminLoginPage() {
  const { loginWithGoogle, isLoading, isAdmin, isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  // Already admin → go straight to dashboard
  useEffect(() => {
    if (isAdmin) navigate('/dashboard', { replace: true })
  }, [isAdmin, navigate])

  // Signed in but NOT admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin && !isLoading) {
      setError(`${user?.email ?? 'This account'} is not authorised as admin.`)
    }
  }, [isAuthenticated, isAdmin, isLoading, user])

  async function handleGoogle() {
    setError('')
    try {
      await loginWithGoogle()
      // useEffect above handles redirect once isAdmin is true
    } catch (err: any) {
      setError('Sign in failed. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Intentionally bare — no logo, no breadcrumb */}
        <div className="w-2 h-2 bg-white/20 rounded-full mb-16" />

        <div className="space-y-5">
          {error && (
            <p className="font-mono text-sm text-red-400/75 border border-red-500/20 bg-red-900/10 px-4 py-3">
              {error}
            </p>
          )}

          <Button
            onClick={handleGoogle}
            className="w-full h-14 text-base font-bold"
            disabled={isLoading}
          >
            {isLoading ? '…' : 'Continue with Google'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
