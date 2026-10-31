/**
 * Template tag for lesson content (Markdown, LaTeX and code).
 * Keeps backslashes literally (so `\frac` and Python's "\n" survive), turns \` into a
 * plain backtick (so Markdown inline code can be written inside the template),
 * and trims the surrounding blank lines.
 */
export function md(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw({ raw: strings.raw }, ...values)
    .replace(/\\`/g, '`')
    .replace(/\\\$\{/g, '${')
    .replace(/^\s*\n/, '')
    .replace(/\s+$/, '');
}
