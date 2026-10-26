module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  printWidth: 100,
  trailingComma: 'es5',
  singleQuote: true,
  tabWidth: 2,
  importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
};
