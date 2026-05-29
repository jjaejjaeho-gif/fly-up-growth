/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'Apple SD Gothic Neo', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 14px 40px rgba(15, 23, 42, 0.10)'
      }
    }
  },
  plugins: []
};
