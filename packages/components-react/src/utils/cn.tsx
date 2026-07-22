export const cn = (...classNames: (string | undefined)[]) => {
  return classNames.filter(Boolean).join(' ');
};
