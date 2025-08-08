/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/public/**/*.{html,js,ts}",
        "./public/**/*.{html,js,ts}",
        "./public/index.html"
    ],
    // safelist: [
    //     'mx-auto',
    //     'mt-1',
    //     'text-red-600',
    //     'text-sm',
    //     'ring-red-500',
    //     'focus:ring-red-500',
    //     // all 0.3s ease-in translateY(-10px) ease-out bg-[var(--primary-color)] opacity-50 cursor-not-allowed text-white hover:bg-gray-200 max-h-0 max-h-screen font-bold text-green-500 tbody hidden text-green-600 text-red-600 none flex
    //     'ring-subtle-border',
    //     'focus:ring-primary-color',
    //     'hover:bg-blue-600',
    // ],
    safelist: [
        // Exact classes
        'mx-auto',
        'mt-1',
        'text-sm',
        'cursor-not-allowed',
        'text-white',
        'tbody',
        'hidden',
        'flex',
        'font-bold',
        'none', // ⚠ Not a Tailwind utility, might be a custom class

        // Color-specific patterns
        { pattern: /text-(red|green)-(500|600)/ },     // text-red-500, text-green-600, etc.
        { pattern: /ring-(red-500|subtle-border)/ },   // ring-red-500, ring-subtle-border
        { pattern: /focus:ring-(red-500|primary-color)/ }, // focus:ring-red-500, focus:ring-primary-color
        { pattern: /hover:bg-(blue-600|gray-200)/ },   // hover:bg-blue-600, hover:bg-gray-200

        // Sizing / spacing
        { pattern: /max-h-(0|screen)/ },               // max-h-0, max-h-screen

        // Opacity
        { pattern: /opacity-(0|50|90|100)/ },

        // Arbitrary values (must be safelisted explicitly, Tailwind can’t guess)
        'bg-[var(--primary-color)]',

        // Animation/transition related
        // Tailwind can't parse "0.3s ease-in translateY(-10px) ease-out" as-is
        // You need to ensure you have a matching Tailwind class setup or plugin
        'transition-all',
        'duration-300',
        'ease-in',
        'ease-out',
        'translate-y-[-10px]', // requires JIT arbitrary values support
    ],
    theme: {
        extend: {
            colors: {
                'primary-color': 'var(--primary-color)',
                'secondary-color': 'var(--secondary-color)',
                'border-color': 'var(--border-color)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'foreground-color': 'var(--foreground-color)',
                'background-color': 'var(--background-color)',
                'subtle-background': 'var(--subtle-background)',
                'subtle-border': 'var(--subtle-border)',
            }
        },
    },
    plugins: [],
}