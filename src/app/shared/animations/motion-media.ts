export const MOTION_ALLOWED_QUERY = '(prefers-reduced-motion: no-preference)';
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
export const FINE_POINTER_MOTION_QUERY = `${FINE_POINTER_QUERY} and ${MOTION_ALLOWED_QUERY}`;
