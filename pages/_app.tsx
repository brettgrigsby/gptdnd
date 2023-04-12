import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
// import { CharacterProvider } from "@/contexts/character-context"
import dynamic from "next/dynamic"

export default function App({ Component, pageProps }: AppProps) {
  const CharacterProvider = dynamic(
    () =>
      import("@/contexts/character-context").then(
        (mod) => mod.CharacterProvider
      ),
    { ssr: false }
  )

  return (
    <ChakraProvider>
      <CharacterProvider>
        <Component {...pageProps} />
      </CharacterProvider>
    </ChakraProvider>
  )
}
