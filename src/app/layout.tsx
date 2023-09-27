'use client'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledComponentsRegistry from "../libs/styled-components/registry";
import { GlobalStyles } from "../styles/global";
import { Header } from "../components/Header";
import { ThemeProvider } from "styled-components";
import light from "../styles/theme/light";
import dark from "../styles/theme/dark";
// import { usePersistedState } from "../hooks/usePersistedState";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Github find",
  description: "",
};

export default function RootLayout({children}: { children: React.ReactNode}) {
  const [theme, setTheme] = useState(light)

  const ToggledTheme = () => {
    setTheme(theme.title === 'light' ? dark : light)
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <ThemeProvider theme={theme}>
            <Header toggledTheme={ToggledTheme}/>
            {children}
            <GlobalStyles />
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
