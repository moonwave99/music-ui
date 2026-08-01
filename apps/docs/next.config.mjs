import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  output: "export",
  // eslint-disable-next-line no-undef
  basePath: process.env.NODE_ENV === "development" ? "" : "/music-ui",
});
