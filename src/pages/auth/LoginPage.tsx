import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Chrome } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const { loginWithGoogle, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function handleGoogle() {
    setError('')
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err: any) {
      setError(err?.message ?? 'Sign-in failed')
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
        <a href="/" className="font-heading text-5xl tracking-[0.1em] text-white block mb-14">RABID</a>

        <h1 className="font-heading text-5xl text-white mb-2">Sign in</h1>
        <p className="font-mono text-sm text-white/35 tracking-wide mb-10">
          Sign in to track orders and manage your account.
        </p>

        <Button
          variant="outline"
          className="w-full gap-3 h-14 text-base"
          onClick={handleGoogle}
          disabled={isLoading}
        >
          <Chrome className="w-5 h-5" />
          {isLoading ? 'Signing in…' : 'Continue with Google'}
        </Button>

        {error && (
          <p className="font-mono text-sm text-red-400/75 border border-red-500/20 bg-red-900/10 px-4 py-3 mt-5">
            {error}
          </p>
        )}
      </motion.div>
    </div>
  )
}
