import { CharacterSelection } from "@/components/chracter-selection"
import {
  Box,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { FormEventHandler, useState } from "react"

function generateRandom4CharacterCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let code = ""
  for (let i = 0; i < 4; i++) {
    code += characters[Math.floor(Math.random() * characters.length)]
  }
  return code
}

export default function Home() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const { onOpen, isOpen, onClose } = useDisclosure()

  const handleStartSession = () => {
    const newCode = generateRandom4CharacterCode()
    router.push(`/rooms/${newCode}`)
  }

  const handleJoinSession: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    router.push(`/rooms/${code}`)
  }

  return (
    <Box
      margin="auto"
      maxWidth="720px"
      height="100vh"
      overflow="auto"
      position="relative"
      p={[2, null, null, 0]}
      textAlign="center"
    >
      <Heading textAlign="center" mb={4}>
        GPTnDnD
      </Heading>
      <Text mb={1}>Welcome to endless roleplaying!</Text>
      <Text mb={4}>
        Enter a room code to join an existing session or start a new one.
      </Text>
      <form onSubmit={handleJoinSession}>
        <InputGroup w="250px" mx="auto">
          <Input
            placeholder="Enter a room code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <InputRightElement w="fit-content" p={1}>
            <Button size="sm" type="submit">
              Join
            </Button>
          </InputRightElement>
        </InputGroup>
      </form>
      <Text my={4}>or</Text>
      <Button w="250px" onClick={handleStartSession}>
        Start a New Session
      </Button>
      <Box mt={4}>
        <Button onClick={onOpen}>Character</Button>
        <CharacterSelection isOpen={isOpen} onClose={onClose} />
      </Box>
    </Box>
  )
}
