import { useEffect, useMemo, useState } from 'react'

const apiBase = '/api'

function routePath() {
  return window.location.pathname
}

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function request(url, options = {}) {
  return fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })
}

function Home({ onNavigate }) {
  return (
    <main className="home-page">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">🔗 LinkShort</div>
          <div className="nav-buttons">
            <button className="button button-secondary" onClick={() => onNavigate('/login')}>Login</button>
            <button className="button" onClick={() => onNavigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Shorten Your URLs<br/><span className="gradient-text">Instantly</span></h1>
          <p className="hero-subtitle">Create short, shareable links and track every click. Free and easy to use.</p>
          <div className="hero-buttons">
            <button className="button button-lg" onClick={() => onNavigate('/register')}>Start Shortening</button>
            <button className="button button-secondary button-lg" onClick={() => onNavigate('/login')}>Already have account?</button>
          </div>
        </div>
        <div className="hero-decoration"></div>
      </section>

      <section className="features">
        <h2>Why Choose LinkShort?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Create short links in milliseconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>Track clicks and monitor performance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Your links are safe and protected</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Ready</h3>
            <p>Works perfectly on all devices</p>
          </div>
        </div>
      </section>
    </main>
  )
}

function AuthForm({ type, onSuccess, onNavigate }) {
  const [formState, setFormState] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const fields = useMemo(() => {
    if (type === 'register') {
      return [
        { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
        { label: 'Email', name: 'email', type: 'email', placeholder: 'your@email.com' },
        { label: 'Password', name: 'password', type: 'password', placeholder: 'At least 6 characters' }
      ]
    }
    return [
      { label: 'Email', name: 'email', type: 'email', placeholder: 'your@email.com' },
      { label: 'Password', name: 'password', type: 'password', placeholder: 'Enter your password' }
    ]
  }, [type])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    const payload = { email: formState.email, password: formState.password }
    if (type === 'register') {
      payload.name = formState.name
    }

    const response = await request(`${apiBase}/auth/${type}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setMessage(data?.message || 'Unable to complete request')
      setLoading(false)
      return
    }

    setMessage(data?.message || 'Success')
    setLoading(false)
    setTimeout(() => onSuccess(), 1000)
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">🔗 LinkShort</div>
          <button className="button button-secondary" onClick={() => onNavigate('/')}>← Back</button>
        </div>
      </nav>
      <main className="page-container auth-page">
        <div className="card auth-card">
          <h1>{type === 'login' ? 'Welcome Back' : 'Create Your Account'}</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
            {type === 'login' 
              ? 'Sign in to access your shortened URLs' 
              : 'Join us to start shortening URLs today'}
          </p>
          <form onSubmit={handleSubmit} className="auth-form">
            {fields.map((field) => (
              <label key={field.name}>
                {field.label}
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formState[field.name] || ''}
                  onChange={(event) => setFormState((prev) => ({
                    ...prev,
                    [field.name]: event.target.value
                  }))}
                  required
                  minLength={field.name === 'password' ? 6 : undefined}
                  disabled={loading}
                />
              </label>
            ))}
            <button type="submit" className="button" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Please wait...' : (type === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
            {type === 'login' 
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button 
              className="button-link"
              onClick={() => onNavigate(type === 'login' ? '/register' : '/login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              {type === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

function Dashboard({ onLogout, onNavigate }) {
  const [user, setUser] = useState(null)
  const [urls, setUrls] = useState([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [message, setMessage] = useState('')
  const [shortenMessage, setShortenMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const response = await request(`${apiBase}/auth/getMe`)
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.user) {
        navigate('/login')
        return
      }
      setUser(data.user)
    }

    loadUser()
  }, [])

  useEffect(() => {
    if (!user) return
    fetchUrls()
  }, [user])

  async function fetchUrls() {
    setMessage('')
    const response = await request(`${apiBase}/url/getMyUrls`)
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setMessage(data?.message || 'Unable to load URLs')
      return
    }
    setUrls(data.urls || [])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setShortenMessage('')
    setLoading(true)

    const response = await request(`${apiBase}/url/shorten`, {
      method: 'POST',
      body: JSON.stringify({ originalUrl })
    })
    const data = await response.json().catch(() => null)
    setLoading(false)
    
    if (!response.ok) {
      setShortenMessage(data?.message || 'Unable to shorten URL')
      return
    }
    setShortenMessage('✅ URL shortened successfully!')
    setOriginalUrl('')
    fetchUrls()
  }

  async function handleDelete(id) {
    const response = await request(`${apiBase}/url/delete/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setMessage(data?.message || 'Unable to delete URL')
      return
    }
    fetchUrls()
  }

  function copyLink(shortCode) {
    const shortUrl = `${window.location.origin}/${shortCode}`
    navigator.clipboard.writeText(shortUrl)
    setShortenMessage('✅ Copied to clipboard!')
  }

  if (!user) {
    return <div className="page-container"><p>Loading dashboard...</p></div>
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">🔗 LinkShort</div>
          <button className="button button-secondary" onClick={onLogout}>Logout</button>
        </div>
      </nav>
      <main className="page-container dashboard-page">
        <div className="top-bar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome, <strong>{user.name}</strong> 👋</p>
          </div>
        </div>
        
        <section className="card">
          <h2>✨ Shorten a URL</h2>
          <form onSubmit={handleSubmit} className="shorten-form">
            <label>
              Enter URL to Shorten
              <input
                type="url"
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                placeholder="https://example.com/very/long/url"
                required
                disabled={loading}
              />
            </label>
            <button type="submit" className="button" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Generating...' : '⚡ Generate Short URL'}
            </button>
          </form>
          {shortenMessage && <p className="message">{shortenMessage}</p>}
        </section>

        <section className="card">
          <div className="section-header">
            <h2>📊 My Links</h2>
            <button type="button" className="button button-secondary" onClick={fetchUrls}>🔄 Refresh</button>
          </div>
          {message && <p className="message" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error)', color: 'var(--error)' }}>{message}</p>}
          <div className="url-list">
            {urls.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No shortened URLs yet</p>
                <p style={{ fontSize: '14px' }}>Create your first short link above ⬆️</p>
              </div>
            ) : (
              urls.map((url) => (
                <div key={url._id} className="url-card">
                  <div>
                    <strong>📍 Original URL</strong>
                    <div><a href={url.originalUrl} target="_blank" rel="noreferrer">{url.originalUrl}</a></div>
                  </div>
                  <div>
                    <strong>🔗 Short Link</strong>
                    <div><a href={`/${url.shortCode}`} target="_blank" rel="noreferrer">{`${window.location.origin}/${url.shortCode}`}</a></div>
                  </div>
                  <div className="url-meta">
                    <span>👁️ Clicks: <strong>{url.clicks}</strong></span>
                    <span>📅 Created: {new Date(url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="url-actions">
                    <button type="button" className="button button-secondary" onClick={() => copyLink(url.shortCode)}>📋 Copy</button>
                    <button type="button" className="button button-secondary" onClick={() => handleDelete(url._id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  )
}

function NotFound({ onNavigate }) {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">🔗 LinkShort</div>
          <button className="button button-secondary" onClick={() => onNavigate('/')}>Home</button>
        </div>
      </nav>
      <main className="page-container home-page">
        <div className="card home-card">
          <h1>❌ Page Not Found</h1>
          <p>Sorry, we couldn't find what you're looking for.</p>
          <button className="button" onClick={() => onNavigate('/')}>← Go Home</button>
        </div>
      </main>
    </>
  )
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(routePath())

  useEffect(() => {
    const onPop = () => setCurrentPath(routePath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const handleNavigate = (path) => {
    navigate(path)
    setCurrentPath(path)
  }

  const handleLogout = async () => {
    await request(`${apiBase}/auth/logout`, { method: 'POST' })
    handleNavigate('/')
  }

  if (currentPath === '/login') {
    return <AuthForm type="login" onSuccess={() => handleNavigate('/dashboard')} onNavigate={handleNavigate} />
  }

  if (currentPath === '/register') {
    return <AuthForm type="register" onSuccess={() => handleNavigate('/dashboard')} onNavigate={handleNavigate} />
  }

  if (currentPath === '/dashboard') {
    return <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />
  }

  if (currentPath === '/') {
    return <Home onNavigate={handleNavigate} />
  }

  return <NotFound onNavigate={handleNavigate} />
}
