import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AdminLoginPage() {
  const { loginWithEmail, isLoading, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  // If already admin, go straight to dashboard
  if (isAdmin) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await loginWithEmail(email, password)
      // After login, check if the signed-in user is actually admin
      // useAuthStore sets isAdmin based on Firestore role
      // We navigate to dashboard — RequireAdmin will bounce non-admins
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      // Keep error message vague — don't reveal what's wrong
      setError('Invalid credentials.')
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
        {/* No logo or breadcrumb — intentionally bare */}
        <div className="w-2 h-2 bg-white/20 rounded-full mb-16" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="h-12 text-base"
            />
          </div>
          <div>
            <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-12 text-base"
            />
          </div>

          {error && (
            <p className="font-mono text-sm text-red-400/75 border border-red-500/20 bg-red-900/10 px-4 py-3">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-14 text-base font-bold mt-2"
            disabled={isLoading}
          >
            {isLoading ? '…' : 'Continue'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
