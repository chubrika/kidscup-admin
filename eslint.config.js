{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "plugins": ["@angular-eslint", "@typescript-eslint"],
  "overrides": [
    {
      "files": ["*.ts"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": ["tsconfig.json"],
        "createDefaultProgram": true
      },
      "rules": {
        "@angular-eslint/directive-selector": ["error", { "type": "attribute", "prefix": "app", "style": "camelCase" }],
        "@angular-eslint/component-selector": ["error", { "type": "element", "prefix": "app", "style": "kebab-case" }],
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"]
    }
  ]
}
