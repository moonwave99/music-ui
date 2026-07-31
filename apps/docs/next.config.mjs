import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  output: "export",
  basePath: "/music-ui",
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./src/mdx-components.ts",
    },
  },
});
