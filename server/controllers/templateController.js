// Templates are defined here on the server
// In a production app, these would be stored in MongoDB
// and managed via an admin dashboard

const TEMPLATES = [
  // ===== BIRTHDAY =====
  { id: 'bday_001', category: 'birthday', title: 'Confetti Birthday', wish: '🎂 Wishing you the happiest of birthdays!', isPremium: false, backgroundUrl: '/backgrounds/bday_bg.png', emoji: '🎂', accentColor: '#fff' },
  { id: 'bday_002', category: 'birthday', title: 'Golden Birthday', wish: '✨ May your birthday shine bright like gold!', isPremium: false, backgroundUrl: '/backgrounds/bday_bg_2.png', emoji: '🎉', accentColor: '#fff' },
  { id: 'bday_003', category: 'birthday', title: 'Party Vibes', wish: '🥳 Time to celebrate – it\'s your day!', isPremium: true, backgroundUrl: '/backgrounds/moti_bg_2.png', emoji: '🥳', accentColor: '#fff' },
  { id: 'bday_004', category: 'birthday', title: 'Midnight Celebration', wish: '🌙 Wishing you a birthday to remember!', isPremium: true, backgroundUrl: '/backgrounds/gold_bg.png', emoji: '🌙', accentColor: '#a78bfa' },

  // ===== ANNIVERSARY =====
  { id: 'anni_001', category: 'anniversary', title: 'Rose Romance', wish: '❤️ Happy Anniversary! Love grows stronger every year.', isPremium: false, backgroundUrl: '/backgrounds/anni_bg_2.png', emoji: '❤️', accentColor: '#c41e3a' },
  { id: 'anni_002', category: 'anniversary', title: 'Golden Love', wish: '💍 To many more years of love and happiness!', isPremium: false, backgroundUrl: '/backgrounds/love_bg.png', emoji: '💍', accentColor: '#fff' },
  { id: 'anni_003', category: 'anniversary', title: 'Luxury Anniversary', wish: '🥂 Celebrating the most beautiful chapter of our lives.', isPremium: true, backgroundUrl: '/backgrounds/anni_bg_2.png', emoji: '🥂', accentColor: '#f6d365' },

  // ===== FESTIVAL =====
  { id: 'fest_001', category: 'festival', title: 'Diwali Dhamaka', wish: '🪔 Wishing you light, love & prosperity this Diwali!', isPremium: false, backgroundUrl: '/backgrounds/diwali_bg.png', emoji: '🪔', accentColor: '#7c2d12' },
  { id: 'fest_002', category: 'festival', title: 'Holi Colours', wish: '🎨 May this Holi fill your life with vibrant colours!', isPremium: false, backgroundUrl: '/backgrounds/holi_bg.png', emoji: '🎨', accentColor: '#fff' },
  { id: 'fest_003', category: 'festival', title: 'Eid Mubarak', wish: '🌙 Eid Mubarak! May Allah bless you with joy.', isPremium: false, backgroundUrl: '/backgrounds/eid_bg.png', emoji: '🌙', accentColor: '#d4edda' },
  { id: 'fest_004', category: 'festival', title: 'Christmas Magic', wish: '🎄 Wishing you a magical Christmas and New Year!', isPremium: true, backgroundUrl: '/backgrounds/xmas_bg.png', emoji: '🎄', accentColor: '#ffecb3' },
  { id: 'fest_005', category: 'festival', title: 'New Year Blast', wish: '🎆 Happy New Year! Here\'s to new beginnings!', isPremium: true, backgroundUrl: '/backgrounds/ny_bg.png', emoji: '🎆', accentColor: '#fbbf24' },

  // ===== LOVE =====
  { id: 'love_001', category: 'love', title: 'Sweet Love', wish: '💕 You make every day brighter and more beautiful.', isPremium: false, backgroundUrl: '/backgrounds/love_bg.png', emoji: '💕', accentColor: '#fff' },
  { id: 'love_002', category: 'love', title: 'Forever Yours', wish: '💝 With you, every moment is a treasure.', isPremium: true, backgroundUrl: '/backgrounds/love_bg_2.png', emoji: '💝', accentColor: '#f9a8d4' },

  // ===== MOTIVATIONAL =====
  { id: 'moti_001', category: 'motivational', title: 'Rise & Shine', wish: '🚀 You\'ve got this! Believe in yourself.', isPremium: false, backgroundUrl: '/backgrounds/moti_bg_2.png', emoji: '🚀', accentColor: '#60a5fa' },
  { id: 'moti_002', category: 'motivational', title: 'Success Mindset', wish: '🏆 Success is the sum of small efforts every day.', isPremium: false, backgroundUrl: '/backgrounds/moti_bg_3.png', emoji: '🏆', accentColor: '#c4b5fd' },
  { id: 'moti_003', category: 'motivational', title: 'Gold Standard', wish: '⭐ Excellence is not a destination, it\'s a journey.', isPremium: true, backgroundUrl: '/backgrounds/gold_bg.png', emoji: '⭐', accentColor: '#fde68a' },
];

/**
 * GET /api/templates
 * Get all templates (filter by category optionally)
 * Premium templates show for all users but are locked unless isPremium
 */
const getTemplates = (req, res) => {
  const { category } = req.query;
  let results = TEMPLATES;
  if (category && category !== 'all') {
    results = TEMPLATES.filter((t) => t.category === category);
  }
  res.json({ templates: results, total: results.length });
};

/**
 * GET /api/templates/:id
 * Get single template by ID
 */
const getTemplateById = (req, res) => {
  const template = TEMPLATES.find((t) => t.id === req.params.id);
  if (!template) return res.status(404).json({ message: 'Template not found.' });
  res.json({ template });
};

module.exports = { getTemplates, getTemplateById };
