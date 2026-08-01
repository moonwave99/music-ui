import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import type { MDXComponents } from "nextra/mdx-components";

import * as clientComponents from "./client-components";

// Get the default MDX components
const themeComponents = getThemeComponents();

// Merge components
export function useMDXComponents(components?: MDXComponents) {
  return {
    ...themeComponents,
    ...components,
    ...clientComponents,
  };
}
