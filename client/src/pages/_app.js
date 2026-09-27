import '../styles/globals.css';
import { useEffect } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }) {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <>
      <Head>
        <title>Agentflow AI — Agentic AI Automation Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

