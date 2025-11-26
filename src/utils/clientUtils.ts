// 客户端工具函数
export function generateDeviceFingerprint(): string {
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = btoa(
      navigator.userAgent +
      navigator.language +
      screen.width + 'x' + screen.height +
      new Date().getTimezoneOffset() +
      (canvas.toDataURL ? canvas.toDataURL() : '')
    ).substring(0, 32);

    return fingerprint;
  }
  return 'server-' + Math.random().toString(36).substring(2, 15);
}