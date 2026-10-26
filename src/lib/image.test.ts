import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE, validateImageFile } from '@/lib/image';

describe('validateImageFile', () => {
  it('accepts supported, non-empty images within the size limit', () => {
    expect(validateImageFile(new File(['image'], 'photo.webp', { type: 'image/webp' }))).toEqual({
      ok: true,
    });
  });

  it('rejects unsupported, empty, and oversized files', () => {
    expect(validateImageFile(new File(['file'], 'document.pdf', { type: 'application/pdf' })).ok)
      .toBe(false);
    expect(validateImageFile(new File([], 'empty.png', { type: 'image/png' })).error)
      .toMatch(/vazio/);
    expect(
      validateImageFile(
        new File([new Uint8Array(MAX_FILE_SIZE + 1)], 'large.jpg', { type: 'image/jpeg' })
      ).error
    ).toMatch(/5 MB/);
  });
});
