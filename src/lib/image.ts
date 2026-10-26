export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const THUMBNAIL_MAX_SIZE = 480;
export const THUMBNAIL_QUALITY = 0.72;

export interface ImageValidationResult {
  ok: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Formato não suportado. Use JPG, PNG, WebP ou GIF.' };
  }
  if (file.size === 0) {
    return { ok: false, error: 'O arquivo de imagem está vazio. Selecione outra imagem.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'Imagem muito grande. O limite é 5 MB.' };
  }
  return { ok: true };
}

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, THUMBNAIL_MAX_SIZE / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY));
      };
      img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}
