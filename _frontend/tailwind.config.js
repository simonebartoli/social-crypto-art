/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                "title": "var(--saira)",
                "main": "var(--rajdhani)"
            },
            colors: {
                "custom-grey": "#1E1E1E",
                "custom-light-grey": "#d0d0d0"
            }
        },
    },
    plugins: [],
}