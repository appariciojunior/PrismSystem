export const resolveValue = (tokens, value) => {
  if (
    typeof value !== 'string' ||
    !value.startsWith('{') ||
    !value.endsWith('}')
  ) {
    return value;
  }
  const fullPath = value.slice(1, -1);
  const parts = fullPath.split('.');
  // Extract the string between curly braces

  function getByPath(obj, pathParts) {
    let current = obj;
    for (const part of pathParts) {
      if (typeof current === 'object' && current !== null) {
        if (part in current) {
          current = current[part];
        } else {
          const found = Object.keys(current).find(
            (key) => key.trim().toLowerCase() === part.trim().toLowerCase()
          );
          if (found) {
            current = current[found];
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    }
    return current;
  }

  // Try as absolute path from root
  let result = getByPath(tokens, parts);

  return result;
};
