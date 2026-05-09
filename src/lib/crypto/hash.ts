import CryptoJS from 'crypto-js';

/**
 * Compute SHA-256 hash of a file
 */
export async function computeFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const wordArray = CryptoJS.lib.WordArray.create(event.target.result as ArrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Compute SHA-256 hash of a string
 */
export function computeStringHash(text: string): string {
  return CryptoJS.SHA256(text).toString();
}
