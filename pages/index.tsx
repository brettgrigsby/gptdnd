import {
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { FormEventHandler, useState, useMemo } from "react"
import { useCharacter } from "@/contexts/character-context"

export default function Home() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const { onOpen, isOpen, onClose } = useDisclosure()
  const character = useCharacter()

  const handleStartSession = () => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    if (!serverUrl) return
    // send post request to server to create room
    fetch(`${serverUrl}/rooms/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        router.push(`/rooms/${data.room_id}`)
      })
      .catch((err) => {
        console.error(err)
      })
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
            isDisabled={!character}
          />
          <InputRightElement w="fit-content" p={1}>
            <Button size="sm" type="submit">
              Join
            </Button>
          </InputRightElement>
        </InputGroup>
      </form>
      <Text my={4}>or</Text>
      <Button w="250px" onClick={handleStartSession} isDisabled={!character}>
        Start a New Session
      </Button>
    </Box>
  )
}
