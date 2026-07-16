/**
 * Збереження Blob на машину користувача через тимчасове посилання <a download>.
 */
import type { FileSaver } from '../../application/ports';

export const saveBlobToDevice: FileSaver = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
