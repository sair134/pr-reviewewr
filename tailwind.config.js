/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/next-frontend/src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/next-frontend/src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/next-frontend/src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};
