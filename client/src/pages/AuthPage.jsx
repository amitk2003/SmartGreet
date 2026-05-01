import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileToBase64, cropImageToCircle } from '../utils/imageUtils';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';
import logo from './logo.jpeg'
// ──────────────────────────────────────────────────────
// Animated background particles (pure CSS animation)
// ──────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  size: Math.random() * 8 + 3,
  left: Math.random() * 100,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * -20,
  color: ['#7c3aed','#a78bfa','#06d6a0','#f59e0b','#3b82f6'][i % 5],
}));

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage() {
  const { register, login, googleLogin, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoData, setPhotoData] = useState(null);

  // ── Form state ──
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });

  const go = () => navigate('/');

  // ── Google Login ──
  const handleGoogle = async () => {
    setLoading(true);
    try { await googleLogin(); go(); }
    catch (e) { toast.error(e.response?.data?.message || 'Google login failed.'); }
    finally { setLoading(false); }
  };

  // ── Guest Login ──
  const handleGuest = async () => {
    setLoading(true);
    try { await guestLogin(); go(); }
    catch (e) { toast.error('Guest login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── Email Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await login(loginForm); go(); }
    catch (err) { toast.error(err.response?.data?.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  // ── Register ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...regForm, photo: photoData });
      go();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  // ── Photo Upload ──
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return; }
    const b64 = await fileToBase64(file);
    const cropped = await cropImageToCircle(b64, 200);
    setPhotoPreview(cropped);
    setPhotoData(cropped);
  };

  return (
    <div className={styles.authBody}>
      {/* Particles */}
      <div className={styles.particles}>
        {PARTICLES.map((p) => (
          <div key={p.id} className={styles.particle} style={{
            width: p.size, height: p.size,
            left: `${p.left}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>

      <div className={styles.wrapper}>
        {/* ── Left Branding ── */}
        <div className={styles.branding}>
          <div className={styles.brandLogo}>
            <div className={styles.logoIcon} >
              <img src={logo}/>
            </div>
            <span className={styles.logoText} >GreetMaster</span>
          </div>
          <h1 className={styles.headline}>
            Create Wishes<br/>That <span className={styles.gradient}>Truly Matter</span>
          </h1>
          <p className={styles.sub}>
            Personalized greeting cards with your photo and name — shared in seconds.
          </p>
          <div className={styles.pills}>
            {['🎂 Birthday','💍 Anniversary','🪔 Festivals','🎄 Christmas','🎆 New Year','❤️ Love'].map((p) => (
              <span key={p} className={styles.pill}>{p}</span>
            ))}
          </div>
          <div className={styles.floatingCard}>
            <div className={styles.previewCard}>
              <div className={styles.previewAvatar}>👤</div>
              <div>
                <p className={styles.previewName}>Your Name Here</p>
                <p className={styles.previewWish}>Happy Birthday! 🎂</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Auth Panel ── */}
        <div className={styles.panel}>
          <div className={styles.card}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button className={`${styles.tabBtn} ${tab === 'login' ? styles.active : ''}`} onClick={() => setTab('login')}>Sign In</button>
              <button className={`${styles.tabBtn} ${tab === 'register' ? styles.active : ''}`} onClick={() => setTab('register')}>Register</button>
            </div>

            {tab === 'login' ? (
              /* ── LOGIN ── */
              <div className={styles.form}>
                <h2 className={styles.formTitle}>Welcome Back 👋</h2>
                <p className={styles.formSub}>Sign in to continue creating memories</p>

                <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
                  <GoogleIcon /> Continue with Google
                </button>
                <div className={styles.divider}><span>or sign in with email</span></div>

                <form onSubmit={handleLogin}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input className={styles.input} type="email" placeholder="you@example.com" required
                      value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrap}>
                      <input className={styles.input} type={showPwd ? 'text' : 'password'} placeholder="Your password" required
                        value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>{showPwd ? '🙈' : '👁️'}</button>
                    </div>
                  </div>
                  <button className={styles.primaryBtn} type="submit" disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : <><span>Sign In</span><span>→</span></>}
                  </button>
                </form>

                <div className={styles.divider}><span>or</span></div>
                <button className={styles.guestBtn} onClick={handleGuest} disabled={loading}>
                  Continue as Guest 👤
                </button>
                <p className={styles.switchText}>Don't have an account? <a onClick={() => setTab('register')}>Register</a></p>
              </div>
            ) : (
              /* ── REGISTER ── */
              <div className={styles.form}>
                <h2 className={styles.formTitle}>Join ClaasPlus ✨</h2>
                <p className={styles.formSub}>Create your account and start personalizing</p>

                <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
                  <GoogleIcon /> Sign up with Google
                </button>
                <div className={styles.divider}><span>or register with email</span></div>

                <form onSubmit={handleRegister}>
                  {/* Photo */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Profile Photo <span className={styles.optional}>(optional)</span></label>
                    <div className={styles.photoArea} onClick={() => document.getElementById('regPhoto').click()}>
                      {photoPreview
                        ? <img src={photoPreview} alt="preview" className={styles.photoImg} />
                        : <><span className={styles.uploadIcon}>📷</span><span className={styles.uploadText}>Click to upload</span></>
                      }
                    </div>
                    <input type="file" id="regPhoto" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input className={styles.input} type="text" placeholder="John Doe" required minLength={2}
                      value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input className={styles.input} type="email" placeholder="you@example.com" required
                      value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrap}>
                      <input className={styles.input} type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" required minLength={6}
                        value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>{showPwd ? '🙈' : '👁️'}</button>
                    </div>
                  </div>
                  <button className={styles.primaryBtn} type="submit" disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : <><span>Create Account</span><span>→</span></>}
                  </button>
                </form>

                <p className={styles.switchText}>Already have an account? <a onClick={() => setTab('login')}>Sign In</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
