import type { ReactNode } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import "../../../../packages/piano/src/styles/index.css";
import pkg from "../../../../package.json";

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
};

const navbar = <Navbar logo={<b>Music UI</b>} />;
const footer = (
  <Footer>MIT {new Date().getFullYear()} © Diego Caponera.</Footer>
);

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head></Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase={`${pkg.homepage}/tree/main/apps/docs`}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
