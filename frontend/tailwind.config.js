export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#428177',
          dark: '#054239',
          deep: '#002623',
          100: '#D9E7E4',
        },
        wheat: {
          light: '#EDEBE0',
          DEFAULT: '#B9A779',
          dark: '#988561',
        },
        umber: {
          DEFAULT: '#6B1F2A',
          dark: '#4A151E',
          deep: '#260F14',
        },
        charcoal: {
          DEFAULT: '#161616',
          medium: '#3D3A3B',
        },
        surface: '#FFFFFF',
        'surface-soft': '#F8F3EB',
        'surface-muted': '#F2ECE2',
      },
      boxShadow: {
        card: '0 24px 60px rgba(2, 38, 33, 0.08)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
};
