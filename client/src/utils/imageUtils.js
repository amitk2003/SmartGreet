/**
 * fileToBase64 – convert File object to base64 data URL
 */
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * cropImageToCircle – crops uploaded photo to 200×200 circle PNG
 */
export const cropImageToCircle = (dataUrl, size = 200) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });

/**
 * loadImage – promise wrapper for loading an image
 */
export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * getAvatarEmoji – deterministic emoji based on name initial
 */
export const getAvatarEmoji = (name = '') => {
  const emojis = ['😊', '🦋', '🌟', '🎯', '🚀', '🌈', '🎨', '🦄', '🔮', '🌺'];
  const idx = (name.charCodeAt(0) || 0) % emojis.length;
  return emojis[idx];
};

/**
 * downloadCanvas – export canvas as PNG download
 */
export const downloadCanvas = (canvas, filename = 'greeting-card.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
