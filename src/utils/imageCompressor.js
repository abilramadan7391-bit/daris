/**
 * Client-side Canvas Image Compressor
 * Resizes and compresses an uploaded image File to a Base64 JPEG data URL.
 * 
 * @param {File} file - The uploaded image file
 * @param {number} maxDimension - Maximum width/height in pixels (default 300px)
 * @param {number} quality - JPEG compression quality between 0 and 1 (default 0.7)
 * @returns {Promise<string>} Base64 Data URL of compressed image
 */
export function compressImage(file, maxDimension = 300, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan berkas gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio & new dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Gagal memuat gambar untuk dikompresi.'));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas gambar.'));
    };

    reader.readAsDataURL(file);
  });
}
