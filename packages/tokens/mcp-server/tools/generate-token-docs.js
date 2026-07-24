import {
  loadTokens,
  flattenTokenObject,
  getNestedValue,
  ensureDirAndWrite,
  defaultGeneratedDocPath
} from './token-utils.js';

function splitGroupPath(groupPath) {
  const knownPrefixes = [
    'foundation',
    'light/',
    'dark/',
    'viewport/',
    'typographyTokens',
    'shadows'
  ];

  for (const prefix of knownPrefixes) {
    if (groupPath === prefix || groupPath.startsWith(`${prefix}.`)) {
      if (prefix.endsWith('/')) {
        const [setNamePart, ...rest] = groupPath.split('.');
        return { setName: setNamePart, innerPath: rest.join('.') };
      }

      if (groupPath === prefix) {
        return { setName: prefix, innerPath: '' };
      }

      return {
        setName: prefix,
        innerPath: groupPath.slice(prefix.length + 1)
      };
    }
  }

  const dotIndex = groupPath.indexOf('.');
  if (dotIndex === -1) {
    return { setName: groupPath, innerPath: '' };
  }

  return {
    setName: groupPath.slice(0, dotIndex),
    innerPath: groupPath.slice(dotIndex + 1)
  };
}

function toMarkdownTableRows(tokens) {
  return tokens
    .map((t) => {
      const value = String(t.value).replace(/\|/g, '\\|');
      const desc = (t.description || '').replace(/\|/g, '\\|');
      return `| ${t.path} | ${t.type || ''} | ${value} | ${desc || '-'} |`;
    })
    .join('\n');
}

export async function generateTokenDocs({ groupPath, outputPath }) {
  const tokens = loadTokens();
  const { setName, innerPath } = splitGroupPath(groupPath);

  if (!(setName in tokens)) {
    return {
      error: `Token set '${setName}' was not found.`,
      requestedGroupPath: groupPath,
      availableSets: Object.keys(tokens).slice(0, 60)
    };
  }

  const setData = tokens[setName];
  const targetNode = innerPath ? getNestedValue(setData, innerPath) : setData;

  if (!targetNode || typeof targetNode !== 'object') {
    return {
      error: `Group path '${groupPath}' could not be resolved to a token object.`,
      resolvedSet: setName,
      innerPath
    };
  }

  const flattened = flattenTokenObject(targetNode);
  if (flattened.length === 0) {
    return {
      error: `Group path '${groupPath}' contains no token leaves.`,
      resolvedSet: setName,
      innerPath
    };
  }

  const fullPrefix = innerPath ? `${setName}.${innerPath}` : setName;
  const normalized = flattened.map((t) => ({
    ...t,
    path: `${fullPrefix}.${t.path}`
  }));

  const generatedAt = new Date().toISOString();
  const markdown = [
    `# Token Documentation: ${groupPath}`,
    '',
    `Generated: ${generatedAt}`,
    '',
    `Total Tokens: ${normalized.length}`,
    '',
    '| Token Path | Type | Value | Description |',
    '| --- | --- | --- | --- |',
    toMarkdownTableRows(normalized)
  ].join('\n');

  const safeName = groupPath.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const resolvedOutputPath =
    outputPath || defaultGeneratedDocPath(`${safeName}.md`);

  ensureDirAndWrite(resolvedOutputPath, markdown);

  return {
    groupPath,
    tokenCount: normalized.length,
    outputPath: resolvedOutputPath,
    preview: normalized.slice(0, 10)
  };
}
