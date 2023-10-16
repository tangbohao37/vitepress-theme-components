/**
 * Regular expression for matching import statements in a string of code.
 */
// export const importRegex = /import[\s\S]*?\n*$/g
export const importRegex = /import\s+[\w*{}\s,]+\s+from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g

/**
 * Regular expression for matching the closing script tag "</script>".
 */
export const scriptRE = /<\/script>/

/**
 * Regular expression for detecting TypeScript script tags in HTML.
 * Matches script tags with a "lang" attribute set to "ts".
 */
export const scriptLangTsRE = /<\s*script[^>]*\blang=['"]ts['"][^>]*/

/**
 * Regular expression for detecting the presence of a `setup` attribute in a `script` tag.
 */
export const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/

/**
 * Regular expression for matching a script tag with the "client" attribute.
 */
export const scriptClientRE = /<\s*script[^>]*\bclient\b[^>]*/

/**
 * Regular expression for matching script tags in HTML.
 * Matches the opening and closing script tags, as well as any content in between.
 */
export const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/
