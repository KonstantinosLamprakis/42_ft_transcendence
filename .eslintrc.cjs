module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'filenames'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'prettier/prettier': ['error'],

        'filenames/match-regex': [2, '^[a-z0-9-]+$', true], // kebab-case

        '@typescript-eslint/naming-convention': [
            'error',

            // Constants: UPPER_CASE
            {
                selector: 'variable',
                modifiers: ['const'],
                format: ['UPPER_CASE'],
                filter: {
                    regex: '^(CN_.*|MIN_.*|MAX_.*|DEFAULT_.*|CONFIG_.*|VERSION)$',
                    match: true
                }
            },

            // Regular const variables (not true constants), let and var as well
            {
                selector: 'variable',
                format: ['camelCase'],
                filter: {
                    regex: '^(?!CN_.*|MIN_.*|MAX_.*|DEFAULT_.*|CONFIG_.*|VERSION)',
                    match: true
                }
            },

            // Functions
            {
                selector: 'function',
                format: ['camelCase']
            },

            // Classes, Types, Interfaces
            {
                selector: 'typeLike',
                format: ['PascalCase']
            },

            // Interfaces (optional: disallow `I` prefix)
            {
                selector: 'interface',
                format: ['PascalCase'],
                custom: {
                    regex: '^I[A-Z]',
                    match: false
                }
            },

            // Enums
            {
                selector: 'enum',
                format: ['PascalCase']
            },

            // Enum members
            {
                selector: 'enumMember',
                format: ['UPPER_CASE']
            },
        ]
    },
    ignorePatterns: ['dist/', 'node_modules/'],
}
