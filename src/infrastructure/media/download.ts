/**
 * Збереження Blob на пристрій користувача.
 * На сенсорних пристроях (iPhone/iPad/Android) — системне меню «Поділитися»
 * (Web Share API Level 2): дає зберегти у «Фото»/«Файли», чого <a download>
 * на iOS не вміє. На десктопі та як фолбек — тимчасове посилання <a download>.
 */
import type { FileSaver } from '../../application/ports';

function saveViaAnchor(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const saveBlobToDevice: FileSaver = async (blob, fileName) => {
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  const file = new File([blob], fileName, { type: blob.type });
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (touchDevice && nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return true;
    } catch (e) {
      // користувач закрив меню «Поділитися» — не дублюємо збереження фолбеком
      if (e instanceof DOMException && e.name === 'AbortError') return false;
      // інші збої (політики, втрата активації) — тихий фолбек на <a download>
    }
  }
  saveViaAnchor(blob, fileName);
  return true;
};
