export const cn = (...classNames) => {
  return classNames.filter(Boolean).join(' ');
};
