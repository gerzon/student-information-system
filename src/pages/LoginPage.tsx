import { useState, type FormEvent } from 'react'
import './LoginPage.css'

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(
      'Login is ready to connect. Configure your authentication service to verify your account.',
    )
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand-panel">
          <a className="login-brand" href="#login" aria-label="PAPSI College Ormoc home">
            <span className="login-brand-mark" aria-hidden="true">
              <img src="/papsi_logo%20(2).png" alt="" />
            </span>
            <span>
              <strong>PAPSI College Ormoc</strong>
              <small>Student Information System</small>
            </span>
          </a>

          <div className="login-welcome">
            <span className="login-welcome-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 20v-1a8 8 0 0 1 16 0v1H4Z" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <h1>Welcome back</h1>
            <p>Sign in to access your student information system account.</p>
          </div>

          <p className="login-panel-footer">Learning today, leading tomorrow.</p>
        </div>

        <div className="login-form-panel">
          <div className="login-form-heading">
            <span className="login-mobile-brand">PAPSI College Ormoc</span>
            <h2 id="login-title">Sign in</h2>
            <p>Enter your account details to continue.</p>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={() =>
              setNotice(
                'Google sign-in is not configured yet. Connect a Google OAuth provider to enable it.',
              )
            }
          >
            <svg className="google-logo" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.64 5.93c4.46-4.11 7.13-10.16 7.13-17.58Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.65-5.93c-2.13 1.43-4.85 2.28-8.25 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="login-divider" aria-hidden="true">
            <span>or sign in with email</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="login-password">Password</label>
                <button
                  className="forgot-password"
                  type="button"
                  onClick={() =>
                    setNotice(
                      'Password reset will be available once the authentication service is connected.',
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>
              <div className="login-password-input">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((show) => !show)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.7M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <label className="remember-account">
              <input type="checkbox" name="rememberMe" />
              <span>Remember me</span>
            </label>

            <button className="login-submit-button" type="submit">
              Sign in
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>

            {notice && (
              <p className="login-notice" role="status">
                {notice}
              </p>
            )}
          </form>

          <p className="login-register-prompt">
            Student? <a href="#register">Claim your account</a>
          </p>
          <a className="login-dashboard-preview" href="#dashboard">
            Preview the dashboard
          </a>
        </div>
      </section>
      <footer className="login-project-footer">
        © {new Date().getFullYear()} PAPSI College Ormoc · Student Information System
      </footer>
    </main>
  )
}

export default LoginPage
