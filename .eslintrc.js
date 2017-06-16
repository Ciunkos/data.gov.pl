module.exports = {
    extends: 'airbnb',
    parser: 'babel-eslint',
    'ecmaFeatures': {
        classes: true,
        jsx: true
    },
    plugins: [
        'react',
        'jsx-a11y',
        'import'
    ],
    rules: {
        semi: 0,
        indent: ['error', 4],
        'linebreak-style': 0,
        'comma-dangle': ['error', 'never'],
        'no-confusing-arrow': 0,
        'react/jsx-filename-extension': 0,
        'react/jsx-indent': 0/*['error', 4]*/,
        'react/prop-types': 0,
        'react/jsx-first-prop-new-line': 0,
        'react/jsx-wrap-multilines': 0,
        'react/jsx-indent-props': 0,
        'import/no-named-as-default': 0,
        'import/no-named-as-default-member': 0,
        'no-shadow': 0,
    },
    settings: {
        'import/resolver': 'webpack'
    },
    env: {
        browser: true,
        node: true,
        jest: true
    }
};