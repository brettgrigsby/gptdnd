import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  Input,
  Select,
  Stack,
  UseDisclosureProps,
} from "@chakra-ui/react"
import { useState } from "react"
import { useCookies } from "react-cookie"
import type { Character } from "@/types"

export const CharacterSelection: React.FC<UseDisclosureProps> = ({
  isOpen,
  onClose: paramOnClose,
}) => {
  const [cookies, setCookie] = useCookies(["gptndnd-character"])
  const traits = cookies["gptndnd-character"] as Character
  const [values, setValues] = useState<Character>({
    name: traits?.name || "",
    race: traits?.race || "human",
    class: traits?.class || "fighter",
  })

  const onClose = paramOnClose || (() => {})

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!values.name) return

    setCookie("gptndnd-character", values)
    onClose()
  }

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValues((values) => ({ ...values, name: e.target.value }))
  }

  const handleRaceChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setValues((values) => ({ ...values, race: e.target.value as any }))
  }

  const handleClassChange: React.ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setValues((values) => ({ ...values, class: e.target.value as any }))
  }

  return (
    <Drawer isOpen={!!isOpen} placement="right" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Heading textAlign="center">Character Selection</Heading>
        </DrawerHeader>
        <DrawerBody maxW="720px" margin="auto">
          <form onSubmit={handleSubmit}>
            <Stack>
              <Input
                value={values.name}
                onChange={handleNameChange}
                placeholder="Character Name"
              />
              <Select value={values.race} onChange={handleRaceChange}>
                {["human", "elf", "dwarf", "halfling", "orc"].map((r) => (
                  <option key={r} value={r}>
                    {r.toUpperCase()}
                  </option>
                ))}
              </Select>
              <Select value={values.class} onChange={handleClassChange}>
                {["fighter", "wizard", "rouge", "cleric", "druid"].map((r) => (
                  <option key={r} value={r}>
                    {r.toUpperCase()}
                  </option>
                ))}
              </Select>
              <Button w="full" type="submit">
                Save
              </Button>
            </Stack>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
