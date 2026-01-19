export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const classNameUtils = {
  cn,
};

export default cn;
