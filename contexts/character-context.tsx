import { createContext, useContext, useMemo } from "react"
import type { Character } from "@/types"
import { cookies } from "next/headers"

type CharacterContextValue = {
  character: Character | null
  setCharacter: (character: Character) => void
}

export const CharacterContext = createContext<CharacterContextValue>({
  character: null,
  setCharacter: () => {},
})

export const useCharacter = () => {
  return useContext(CharacterContext)
}

export const CharacterProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // const cookieStore = cookies()
  // const character = useMemo(() => {
  //   const char = cookieStore.get("gptndnd-character")
  //   if (!char) return null
  //   return JSON.parse(char.value) as Character
  // }, [cookieStore])
  const character = null

  const setCharacter = (character: Character) => {
    // cookieStore.set("gptndnd-character", JSON.stringify(character))
  }

  const value = {
    character,
    setCharacter,
  }

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  )
}
