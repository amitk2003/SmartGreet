import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { templateAPI, userAPI } from '../api';
import { composeCard, composeVideoCard } from '../utils/canvasComposer';
import { downloadCanvas, fileToBase64, cropImageToCircle, getAvatarEmoji } from '../utils/imageUtils';
import toast from 'react-hot-toast';
import styles from './HomePage.module.css';
import logo from './logo.jpeg'
const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂' },
  { id: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { id: 'festival', label: 'Festival', emoji: '🪔' },
  { id: 'love', label: 'Love', emoji: '❤️' },
  { id: 'motivational', label: 'Motivational', emoji: '🚀' },
];

export default function HomePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [canvasRendering, setCanvasRendering] = useState(false);
  const [customWish, setCustomWish] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textColor, setTextColor] = useState('#ffffff');
  const [aiTone, setAiTone] = useState('Emotional');

  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const canvasRef = useRef(null);

  // Fetch templates from backend
  useEffect(() => {
    const fetch = async () => {
      setLoadingTemplates(true);
      try {
        const { data } = await templateAPI.getAll(category);
        setTemplates(data.templates);
      } catch { toast.error('Failed to load templates.'); }
      finally { setLoadingTemplates(false); }
    };
    fetch();
  }, [category]);

  // Handle Stripe Success Callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' && user && !user.isPremium) {
      const verifyPayment = async () => {
        try {
          const { data } = await userAPI.subscribeSuccess();
          updateUser(data.user);
          toast.success('🎉 Premium activated! Welcome to the VIP tier!');
          window.history.replaceState({}, document.title, "/");
        } catch (err) {
          toast.error('Failed to verify payment.');
        }
      };
      verifyPayment();
    }
  }, [user, updateUser]);

  // Render canvas when preview opens
  useEffect(() => {
    if (showPreview && selectedTemplate && canvasRef.current) {
      setCanvasRendering(true);
      composeCard(canvasRef.current, { ...selectedTemplate, wish: customWish, fontFamily, textColor }, user)
        .then(() => setCanvasRendering(false))
        .catch(() => { toast.error('Failed to render card.'); setCanvasRendering(false); });
    }
  }, [showPreview, selectedTemplate, customWish, fontFamily, textColor, user]);

  // Filter by search
  const displayed = search.trim()
    ? templates.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.includes(search.toLowerCase())
      )
    : templates;

  // Template click
  const handleTemplateClick = (t) => {
    setSelectedTemplate(t);
    setCustomWish(t.wish || '');
    if (t.isPremium && !user.isPremium) {
      setShowPremium(true);
    } else {
      setShowPreview(true);
    }
  };

  // Subscribe via Stripe
  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const { data } = await userAPI.subscribe();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch { toast.error('Failed to initiate payment. Please try again.'); }
    finally { setSubscribing(false); }
  };

  const handleShare = async (platform) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getBlob = () => new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    try {
      switch (platform) {
        case 'whatsapp': {
          try {
            const blob = await getBlob();
            const file = new File([blob], 'greeting.png', { type: 'image/png' });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({ files: [file], title: 'A greeting for you!', text: 'Check out this greeting card!' });
                return;
              } catch (err) {
                if (err.name === 'AbortError') return;
              }
            }

            await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
            toast.success('📱 Desktop: Image copied! Opening WhatsApp... please Paste it (Ctrl+V)!', { duration: 5000 });
            setTimeout(() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this greeting card I made on ClaasPlus! (Paste the image here)')}`, '_blank'), 1500);
          } catch (e) {
            downloadCanvas(canvas, 'greeting.png');
            toast.success('📱 Image downloaded! Open WhatsApp to attach it.', { duration: 4000 });
          }
          break;
        }
        case 'email':
          downloadCanvas(canvas, 'greeting.png');
          window.location.href = `mailto:?subject=A greeting for you!&body=Check out this card I made with ClaasPlus!`;
          break;
        case 'copy': {
          try {
            const blob = await getBlob();
            await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
            toast.success('✅ Image copied to clipboard! You can now paste it.');
          } catch (err) {
            console.error('Clipboard error:', err);
            downloadCanvas(canvas, 'greeting.png');
            toast.success('⬇️ Could not copy, downloaded instead!');
          }
          break;
        }
        case 'native': {
          try {
            const blob = await getBlob();
            const file = new File([blob], 'greeting.png', { type: 'image/png' });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'A greeting for you!' });
            } else if (navigator.share) {
              await navigator.share({ title: 'A greeting for you!', text: 'Check out this greeting card!' });
              downloadCanvas(canvas, 'greeting.png');
              toast.success('⬇️ Image downloaded. You can attach it in the app!');
            } else {
              downloadCanvas(canvas, 'greeting.png');
              toast.success('⬇️ Downloaded! (Native share not supported)');
            }
          } catch (e) {
            if (e.name !== 'AbortError') {
              downloadCanvas(canvas, 'greeting.png');
              toast.success('⬇️ Downloaded as fallback!');
            }
          }
          break;
        }
        default:
          downloadCanvas(canvas, 'greeting.png');
          toast.success('⬇️ Card downloaded!');
      }
    } catch (globalErr) {
      console.error('Global share error:', globalErr);
      // Removed the global fallback download to avoid multiple downloads
      toast.error('An error occurred while sharing.');
    }
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await userAPI.updateProfile({ name: editName, photo: editPhoto });
      updateUser(data.user);
      toast.success('✅ Profile updated!');
      setShowProfile(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); }
    finally { setSavingProfile(false); }
  };

  const handleEditPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    const cropped = await cropImageToCircle(b64, 200);
    setEditPhotoPreview(cropped);
    setEditPhoto(cropped);
  };

  const handleGenerateAI = () => {
    const toneMap = {
      Funny: {
        birthday: ["Happy Birthday! You're officially too old to drop it like it's hot.", "Another year closer to Velcro shoes!", "You're not old, you're vintage! 🎉"],
        anniversary: ["I love you more than pizza. And I really love pizza.", "Happy Anniversary! We still haven't killed each other!", "Here's to another year of stealing the blankets."],
        festival: ["May your festival be lit! literally.", "Eat, sleep, celebrate, repeat! 🎊", "Calories don't count during festivals!"],
        love: ["I love you like a nerd loves math.", "You're my favorite thing to do... wait.", "I love you more than wifi."],
        motivational: ["If at first you don't succeed, hide all evidence you tried.", "You can do anything! Except that. Don't do that.", "Hustle until your haters ask if you're hiring."]
      },
      Emotional: {
        birthday: ["May your special day be surrounded by happiness and love!", "Wishing you a year filled with wonderful adventures!", "Your presence in my life is a true blessing."],
        anniversary: ["Every day with you is a gift. Happy Anniversary.", "My love for you grows stronger with every passing year.", "To my soulmate, thank you for everything."],
        festival: ["Wishing you light, prosperity, and endless joy.", "May this beautiful festival bring peace to your home.", "Sending you heartfelt prayers and warm wishes."],
        love: ["You are the beat of my heart and the soul of my life.", "I never knew love until I met you.", "Forever isn't long enough with you."],
        motivational: ["Believe in yourself, for you are capable of amazing things.", "Every storm runs out of rain. Keep going.", "Your strength is greater than any obstacle."]
      },
      Formal: {
        birthday: ["Wishing you a very Happy Birthday and a prosperous year ahead.", "Best wishes on your birthday.", "Warmest regards on your special day."],
        anniversary: ["Wishing you continued joy and success in your marriage.", "Happy Anniversary to a wonderful couple.", "Best wishes on this momentous occasion."],
        festival: ["Wishing you and your family a joyous festival season.", "Warm greetings on this auspicious occasion.", "May success and prosperity be with you."],
        love: ["You have my deepest affection and respect.", "I hold you in the highest regard.", "My dearest, you are truly cherished."],
        motivational: ["Excellence is a continuous journey. Strive for greatness.", "Success is the result of preparation and hard work.", "Maintain your focus and achieve your goals."]
      }
    };
    
    const cat = selectedTemplate?.category?.toLowerCase() || 'birthday';
    const fallback = ['Wishing you all the best!', 'Have a wonderful day!'];
    const wishes = toneMap[aiTone]?.[cat] || fallback;
    
    let newWish = wishes[Math.floor(Math.random() * wishes.length)];
    if (newWish === customWish && wishes.length > 1) {
      newWish = wishes.find(w => w !== customWish) || newWish;
    }
    setCustomWish(newWish);
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    if (user?.isPremium) {
      toast.success('Downloading in stunning HD! 💎');
      const tempCanvas = document.createElement('canvas');
      await composeCard(tempCanvas, { ...selectedTemplate, wish: customWish, fontFamily, textColor, isHD: true }, user);
      downloadCanvas(tempCanvas, `claasplus-HD-${selectedTemplate.id}.png`);
    } else {
      downloadCanvas(canvasRef.current, `claasplus-${selectedTemplate.id}.png`);
    }
  };

  const handleDownloadVideo = async () => {
    if (!user?.isPremium) return;
    toast.success('🎬 Recording 4-second video... please wait!', { duration: 4000 });
    setCanvasRendering(true);
    
    try {
      const tempCanvas = document.createElement('canvas');
      const videoBlob = await composeVideoCard(tempCanvas, { ...selectedTemplate, wish: customWish, fontFamily, textColor }, user);
      
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claasplus-animated-${selectedTemplate.id}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('✅ Video saved successfully! You can share it on WhatsApp.', { duration: 5000 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate video.');
    } finally {
      setCanvasRendering(false);
    }
  };

  const openProfile = () => {
    setEditName(user.name);
    setEditPhoto(user.photo);
    setEditPhotoPreview(user.photo);
    setShowProfile(true);
  };

  return (
    <div className={styles.page}>
      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <div className={styles.navLogoIcon}>
            <img src={logo} alt="GreetMaster Logo" />
          </div>
          <span className={styles.navLogoText}>GreetMaster</span>
        </div>
        <div className={styles.navSearch}>
          <span className={styles.searchIcon}>🔍</span>
          <input placeholder="Search birthday, festival..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className={styles.navActions}>
          {!user?.isPremium && (
            <button className={styles.premiumBtn} onClick={() => { setSelectedTemplate({ title: '', isPremium: true }); setShowPremium(true); }}>
              👑 Go Premium
            </button>
          )}
          <div className={styles.navAvatar} onClick={openProfile} title={user?.name}>
            {user?.photo
              ? <img src={user.photo} alt={user.name} />
              : <span>{getAvatarEmoji(user?.name)}</span>
            }
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <span className={styles.eyebrow}>✨ 100% Free Templates Available</span>
        <h1 className={styles.heroTitle}>
          Your Personalized<br/>
          <span className={styles.gradient}>Greeting Cards</span>
        </h1>
        <p className={styles.heroSub}>Pick a template — see your photo and name overlaid instantly.</p>

        <div className={styles.profileRow}>
          <div className={styles.profileAvatar}>
            {user?.photo
              ? <img src={user.photo} alt={user.name} />
              : <span>{getAvatarEmoji(user?.name)}</span>
            }
          </div>
          <div>
            <p className={styles.profileName}>{user?.name}</p>
            <p className={styles.profileSub}>Your wishes are ready to personalize!</p>
          </div>
          <button className={styles.editBtn} onClick={openProfile}>✏️ Edit</button>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className={styles.main}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Browse by Category</h2>
        </div>
        <div className={styles.categoryScroll}>
          {CATEGORIES.map(c => (
            <button key={c.id}
              className={`${styles.chip} ${category === c.id ? styles.activeChip : ''}`}
              onClick={() => setCategory(c.id)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* ── GRID ── */}
        <div className={styles.sectionHeader} style={{ marginTop: '28px' }}>
          <h2 className={styles.sectionTitle}>All Templates</h2>
          <span className={styles.count}>{displayed.length} templates</span>
        </div>

        {loadingTemplates ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}><span>🔍</span><p>No templates found.</p></div>
        ) : (
          <div className={styles.grid}>
            {displayed.map((t) => (
              <div key={t.id} className={styles.card} onClick={() => handleTemplateClick(t)}>
                <div className={styles.cardBg} style={{ 
                  background: t.backgroundUrl ? `url(${t.backgroundUrl}) center/cover` : t.gradient 
                }} />
                <div className={styles.cardOverlay} />

                {/* Free / Premium badge */}
                <div className={styles.cardBadge}>
                  {t.isPremium
                    ? <span className={styles.premiumBadge}>👑 Premium</span>
                    : <span className={styles.freeBadge}>✓ Free</span>
                  }
                </div>

                {/* Lock overlay for locked premium */}
                {t.isPremium && !user?.isPremium && (
                  <div className={styles.lockLayer}><div className={styles.lockIcon}>🔒</div></div>
                )}

                {/* Big emoji */}
                <div className={styles.cardEmoji}>{t.emoji}</div>

                {/* User overlay */}
                <div className={styles.userOverlay}>
                  <div className={styles.overlayAvatar}>
                    {user?.photo
                      ? <img src={user.photo} alt={user.name} />
                      : <span>{getAvatarEmoji(user?.name)}</span>
                    }
                  </div>
                  <div className={styles.overlayInfo}>
                    <p className={styles.overlayName}>{user?.name}</p>
                    <p className={styles.overlayWish}>{t.emoji} {t.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          CARD PREVIEW MODAL
      ══════════════════════════════════════════ */}
      {showPreview && selectedTemplate && (
        <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}>
          <div className={styles.previewModal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>✨ {selectedTemplate.title}</h2>
              <button className={styles.closeBtn} onClick={() => setShowPreview(false)}>✕</button>
            </div>

            <div className={styles.canvasWrap}>
              {canvasRendering && (
                <div className={styles.canvasLoader}><div className={styles.spinner} /><span>Generating your card...</span></div>
              )}
              <canvas ref={canvasRef} className={styles.canvas} style={{ opacity: canvasRendering ? 0 : 1 }} />
              
              {/* Premium Animated Overlays */}
              {selectedTemplate.isPremium && !canvasRendering && (
                <>
                  <div className={styles.premiumCanvasOverlay} />
                  <div className={styles.premiumSparkles} />
                </>
              )}
            </div>

            <div className={styles.customTextWrap}>
              <label className={styles.customTextLabel}>
                Personalize your message {user?.isPremium ? '' : <span style={{ fontSize: '0.75rem', marginLeft: '6px', background: 'rgba(245,158,11,0.2)', padding: '2px 6px', borderRadius: '4px', color: '#f59e0b' }}>👑 Premium Only</span>}
              </label>
              
              {user?.isPremium ? (
                <>
                  <div className={styles.premiumToolbar}>
                    <select className={styles.fontSelect} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Playfair Display">Playfair</option>
                      <option value="Comic Sans MS">Comic Sans</option>
                      <option value="Brush Script MT">Cursive</option>
                    </select>
                    <input type="color" className={styles.colorPicker} value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                    <select className={styles.toneSelect} value={aiTone} onChange={(e) => setAiTone(e.target.value)}>
                      <option value="Emotional">❤️ Emotional</option>
                      <option value="Funny">😄 Funny</option>
                      <option value="Formal">🎩 Formal</option>
                    </select>
                  </div>
                  <textarea 
                    className={styles.customTextArea} 
                    value={customWish} 
                    onChange={(e) => setCustomWish(e.target.value)}
                    maxLength={150}
                    placeholder="Write your custom wish here..."
                  />
                  <button className={styles.aiBtn} onClick={handleGenerateAI}>
                    ✨ Generate AI Wish ({aiTone})
                  </button>
                </>
              ) : (
                <div 
                  onClick={() => { setSelectedTemplate({ title: 'AI & Custom Text', isPremium: true }); setShowPremium(true); setShowPreview(false); }}
                  style={{ width: '100%', padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(245,158,11,0.4)', borderRadius: '10px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <p style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '4px' }}>🔒 Locked Feature</p>
                  <p>Upgrade to Premium to write custom wishes and use the AI Generator!</p>
                </div>
              )}
            </div>

            <p className={styles.shareLabel}>Share via</p>
            <div className={styles.shareGrid}>
              {[
                { id: 'whatsapp', icon: '💬', label: 'WhatsApp' },
                { id: 'email', icon: '📧', label: 'Email' },
                { id: 'copy', icon: '🔗', label: 'Copy' },
                { id: 'native', icon: '📤', label: 'More' },
              ].map(s => (
                <button key={s.id} className={styles.shareBtn} onClick={() => handleShare(s.id)}>
                  <span className={styles.shareIcon}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className={styles.downloadBtn} onClick={handleDownload} style={{ flex: 1 }}>
                ⬇️ Download {user?.isPremium ? 'HD Image 💎' : 'Card'}
              </button>
              
              {user?.isPremium && (
                <button className={styles.downloadBtn} onClick={handleDownloadVideo} style={{ flex: 1, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: 'none' }}>
                  🎬 Download Video
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PREMIUM MODAL
      ══════════════════════════════════════════ */}
      {showPremium && (
        <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && setShowPremium(false)}>
          <div className={styles.premiumModal}>
            <div className={styles.premiumIcon}>👑</div>
            <h2 className={styles.premiumTitle}>Go Premium!</h2>
            <p className={styles.premiumSub}>
              {selectedTemplate?.title ? `Unlock "${selectedTemplate.title}" and` : 'Unlock'} all exclusive templates.
            </p>
            <ul className={styles.featureList}>
              {['Access all premium & exclusive templates', 'Remove watermark from your cards', 'High-resolution downloads', 'Priority new template access', 'Cancel anytime'].map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className={styles.pricing} style={{ margin: '20px 0', textAlign: 'center' }}>
              <span className={styles.price} style={{ fontSize: '3.2rem', fontWeight: '900', color: '#f59e0b', textShadow: '0 2px 10px rgba(245,158,11,0.3)' }}>₹99</span>
              <span className={styles.period} style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: '500' }}> / month</span>
            </div>
            <button className={styles.subscribeBtn} onClick={handleSubscribe} disabled={subscribing}>
              {subscribing ? <span className={styles.spinner} /> : '⚡ Subscribe Now'}
            </button>
            <button className={styles.laterBtn} onClick={() => setShowPremium(false)}>Maybe later</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EDIT PROFILE MODAL
      ══════════════════════════════════════════ */}
      {showProfile && (
        <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && setShowProfile(false)}>
          <div className={styles.profileModal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Profile</h2>
              <button className={styles.closeBtn} onClick={() => setShowProfile(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className={styles.photoUploadArea} onClick={() => document.getElementById('editProfilePhoto').click()}>
                {editPhotoPreview
                  ? <img src={editPhotoPreview} alt="preview" className={styles.editPhotoImg} />
                  : <span className={styles.uploadIcon}>{getAvatarEmoji(user?.name)}</span>
                }
                <span className={styles.uploadText}>Change Photo</span>
                <input type="file" id="editProfilePhoto" accept="image/*" style={{ display: 'none' }} onChange={handleEditPhotoChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Display Name</label>
                <input className={styles.inputField} value={editName} onChange={(e) => setEditName(e.target.value)} required minLength={2} />
              </div>
              {user?.email && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.inputField} value={user.email} disabled style={{ opacity: .5 }} />
                </div>
              )}
              <button className={styles.saveBtn} type="submit" disabled={savingProfile}>
                {savingProfile ? <span className={styles.spinner} /> : 'Save Changes →'}
              </button>
            </form>
            <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
