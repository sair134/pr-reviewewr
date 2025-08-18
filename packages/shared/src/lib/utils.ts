export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    if (i > 0 && i % 4 === 0) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeRepositoryName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_\/]/g, '');
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function isDevelopment(): boolean {
  return process.env['NODE_ENV'] === 'development';
}

export function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production';
}
