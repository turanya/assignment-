module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D0A69',
        secondary: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#e6edf8' // Lighter blue for background
      }
    }
  },
  plugins: []
};
