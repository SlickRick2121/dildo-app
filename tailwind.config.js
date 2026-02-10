/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'bounce-short': 'bounce 0.5s infinite',
                'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            colors: {
                'pastel-pink': '#ffd1dc',
                'pastel-blue': '#aecbfa',
            },
        },
    },
    plugins: [],
}
