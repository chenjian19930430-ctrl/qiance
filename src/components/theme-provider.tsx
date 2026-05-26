'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute: string;
  defaultTheme: string;
  enableSystem: boolean;
  disableTransitionOnChange: boolean;
};

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const NextThemesProviderAny = NextThemesProvider as React.ComponentType<any>;
  return <NextThemesProviderAny {...props}>{children}</NextThemesProviderAny>;
}
