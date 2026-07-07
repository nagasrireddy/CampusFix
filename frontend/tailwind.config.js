// ---------------------------------------------------------
// tailwind.config.js
// Defines the CampusFix design language: high-contrast, solid
// backgrounds only (NO transparency/glassmorphism utilities are
// used anywhere in this project - see design constraint in the
// project brief). Dark and light themes both rely on opaque
// surface colors for maximum text readability.
// ---------------------------------------------------------

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand accent - used for primary actions/links across all portals
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        // Solid opaque surfaces - light theme
        surface: {
          light: '#ffffff',
          lightMuted: '#f1f5f9',
          lightBorder: '#cbd5e1',
        },
        // Solid opaque surfaces - dark theme
        ink: {
          900: '#0b1120', // page background (dark)
          800: '#111827', // card/panel background (dark)
          700: '#1f2937', // elevated surface / hover (dark)
          600: '#374151', // borders (dark)
        },
        // Status/priority semantic colors - solid, high-contrast
        status: {
          submitted: '#64748b',
          assigned: '#2563eb',
          progress: '#d97706',
          resolved: '#16a34a',
        },
        priority: {
          low: '#16a34a',
          medium: '#d97706',
          high: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
