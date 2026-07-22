const FRONTMATTER_REGEX = /^---\n[\s\S]*?\n---\n?/;
const TITLE_REGEX = /^\s*#\s+.+\n?/;
const PROPERTIES_SECTION_REGEX =
  /^##\s+Properties\s*[\s\S]*?(?=^##\s+|(?![\s\S]))/im;
const MARKDOWN_TABLE_BLOCK_REGEX = /^(?:\s*\|.*\|\s*\n)+/gm;
const HORIZONTAL_RULE_REGEX = /^\s*---\s*$/gm;
const EXCESS_BLANK_LINES_REGEX = /\n{3,}/g;
const DOS_DONTS_SECTION_REGEX =
  /###\s+Do\s*\n([\s\S]*?)\n###\s+Don['’]t\s*\n([\s\S]*?)(?=\n##\s+|$)/gi;
const BULLET_ITEM_REGEX = /^\s*-\s+(.+)$/gm;

function extractBulletItems(section = '') {
  const items = [];
  let match;

  while ((match = BULLET_ITEM_REGEX.exec(section)) !== null) {
    items.push(match[1].trim());
  }

  return items;
}

function renderDosDontsCards(markdown = '') {
  return markdown.replace(
    DOS_DONTS_SECTION_REGEX,
    (_, doSection, dontSection) => {
      const doItems = extractBulletItems(doSection);
      const dontItems = extractBulletItems(dontSection);

      if (!doItems.length && !dontItems.length) {
        return _;
      }

      const doList = doItems.map((item) => `<li>${item}</li>`).join('');
      const dontList = dontItems.map((item) => `<li>${item}</li>`).join('');

      return [
        '<div class="ds-dos-donts">',
        '  <div class="ds-dos-donts-card ds-dos-donts-card--do">',
        '    <h4>Do</h4>',
        `    <ul>${doList}</ul>`,
        '  </div>',
        '  <div class="ds-dos-donts-card ds-dos-donts-card--dont">',
        "    <h4>Don't</h4>",
        `    <ul>${dontList}</ul>`,
        '  </div>',
        '</div>'
      ].join('\n');
    }
  );
}

export function getStorybookComponentDoc(
  markdown = '',
  options = { includePropertiesSection: true, includeMarkdownTables: true }
) {
  const { includePropertiesSection = true, includeMarkdownTables = true } =
    options;
  const withoutFrontmatter = markdown.replace(FRONTMATTER_REGEX, '');
  const withoutTitle = withoutFrontmatter.replace(TITLE_REGEX, '');
  const withoutPropertiesSection = includePropertiesSection
    ? withoutTitle
    : withoutTitle.replace(PROPERTIES_SECTION_REGEX, '');
  const withoutTables = includeMarkdownTables
    ? withoutPropertiesSection
    : withoutPropertiesSection.replace(MARKDOWN_TABLE_BLOCK_REGEX, '');
  const withoutRules = withoutTables.replace(HORIZONTAL_RULE_REGEX, '');
  const withDosDontsCards = renderDosDontsCards(withoutRules);
  const normalizedSpacing = withDosDontsCards.replace(
    EXCESS_BLANK_LINES_REGEX,
    '\n\n'
  );

  return normalizedSpacing.trim();
}
