const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const filenamesPlugin = require('eslint-plugin-filenames');

module.exports = [
    {
        ignores: ['dist/', 'node_modules/', 'public/'],
    },
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            prettier: prettierPlugin,
            filenames: filenamesPlugin,
        },
        rules: {
            'prettier/prettier': ['error'],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    format: ['camelCase', 'UPPER_CASE'],
                },
                { selector: 'variable', format: ['camelCase'] },
                { selector: 'function', format: ['camelCase'] },
                { selector: 'typeLike', format: ['PascalCase'] },
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: { regex: '^I[A-Z]', match: false },
                },
                { selector: 'enum', format: ['PascalCase'] },
                { selector: 'enumMember', format: ['UPPER_CASE'] },
            ],
        },
    },
];