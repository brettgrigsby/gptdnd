import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
import { CookiesProvider } from "react-cookie"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CookiesProvider>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </CookiesProvider>
  )
}
