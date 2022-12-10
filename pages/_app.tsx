import '../styles/globals.css'
import { useEffect } from 'react';
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import axios from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,   // react-queryはfetchに失敗した場合には自動的に3回繰り返すという設定にデフォルトでなっているが、今回その機能は使用しない
      refetchOnWindowFocus: false,  // ユーザーがブラウザにフォーカスした際にfetchが走るという機能があるがそれも使わない
    }
  }
})

export default function App({ Component, pageProps }: AppProps) {
  axios.defaults.withCredentials = true   // フロントとサーバーでクッキーのやり取りをする場合はtrueにしておく

  // Next.jsからRESTAPIにリクエストを送るときは全てwithCredential->true, csrf-tokenがヘッダーに付与される形になる。
  useEffect(() => {
    const getCsrtToken = async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/csrf`
      )
      // headerにトークンを設定する
      axios.defaults.headers.common['csrf-token'] = data.csrfToken
    }
    getCsrtToken()
  },[])

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: 'dark',
          fontFamily: 'Verdana, sans-serif',
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
