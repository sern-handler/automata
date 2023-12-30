'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export default function NextAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionProvider basePath='/auth'>{children}</SessionProvider>;
}