import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledComponentsRegistry, {
  ThemeProvider,
} from "../libs/styled-components/registry";
import { GlobalStyles } from "../styles/global";
import light from "../styles/theme/light";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../services/react-query";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Github find",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <StyledComponentsRegistry>
            <ThemeProvider theme={light}>
              {children}
              <GlobalStyles />
            </ThemeProvider>
          </StyledComponentsRegistry>
        </QueryClientProvider>
      </body>
    </html>
  );
}
