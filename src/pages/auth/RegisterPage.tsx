import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Chrome } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function RegisterPage() {
  const { register, loginWithGoogle, isLoading } = useAuthStore()
  const navigate  = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    try { await register(name, email, password); navigate('/') }
    catch (err: any) { setError(err?.message ?? 'Registration failed') }
  }

  async function handleGoogle() {
    setError('')
    try { await loginWithGoogle(); navigate('/') }
    catch (err: any) { setError(err?.message ?? 'Google sign-in failed') }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <Link to="/" className="font-heading text-5xl tracking-[0.1em] text-white block mb-12">RABID</Link>
        <p className="font-mono text-sm tracking-widest uppercase text-white/35 mb-2">New here</p>
        <h1 className="font-display text-4xl italic text-white mb-10">Create Account</h1>

        <Button variant="outline" className="w-full mb-5 gap-3 h-14 text-base" onClick={handleGoogle} disabled={isLoading}>
          <Chrome className="w-5 h-5" /> Continue with Google
        </Button>

        <div className="flex items-center gap-4 mb-5">
          <Separator className="flex-1 opacity-15" />
          <span className="font-mono text-sm text-white/25 tracking-widest uppercase">or</span>
          <Separator className="flex-1 opacity-15" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="h-12 text-base" />
          </div>
          <div>
            <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 text-base" />
          </div>
          <div>
            <Label className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2 block">Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-12 text-base" />
          </div>
          {error && <p className="font-mono text-sm text-red-400/75 border border-red-500/20 bg-red-900/10 px-4 py-3">{error}</p>}
          <Button type="submit" className="w-full h-14 text-base font-bold" disabled={isLoading}>
            {isLoading ? 'Creating…' : 'Create Account'}
          </Button>
        </form>

        <p className="font-mono text-sm text-white/30 text-center mt-8">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-white/60 hover:text-white transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
