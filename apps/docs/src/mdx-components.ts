import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import type { MDXComponents } from "nextra/mdx-components";
import * as clientComponents from "./client-components";
import { Callout } from "nextra/components";
import { Installation } from "./Installation";

const themeComponents = getThemeComponents();

export function useMDXComponents(components?: MDXComponents) {
  return {
    ...themeComponents,
    ...components,
    ...clientComponents,
    Callout,
    Installation,
  };
}
