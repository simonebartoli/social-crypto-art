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
                "custom-blue": "#60A5FAFF",
                "custom-dark-green": "#14532DFF",
                "custom-green": "#5bd55c",
                "custom-red": "#EF4444FF",
                "custom-grey": "#1E1E1E",
                "custom-light-grey": "#d0d0d0"
            }
        },
    },
    plugins: [],
}