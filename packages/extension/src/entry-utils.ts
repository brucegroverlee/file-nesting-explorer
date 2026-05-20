import { extname, parse } from "path";

/**
 * Returns the file's name without extension. For
 * `/path/to/Component.tsx` it returns `Component`.
 */
export const getName = (filename: string): string => parse(filename).name;

/**
 * Returns the file's extension without the leading dot. For
 * `/path/to/Component.tsx` it returns `tsx`.
 */
export const getExtension = (filename: string): string =>
  extname(filename).slice(1);
