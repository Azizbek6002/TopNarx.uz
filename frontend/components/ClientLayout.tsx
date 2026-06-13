'use client';

import dynamic from 'next/dynamic';

const ChatBot = dynamic(
  () => import('@/components/ChatBot'),
  {
    ssr: false,
    loading: () => null
  }
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}