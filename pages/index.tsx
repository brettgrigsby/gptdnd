import { Box, Button, Heading, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"

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

  const handleStartSession = () => {
    const code = generateRandom4CharacterCode()
    router.push(`/rooms/${code}`)
  }

  return (
    <Box>
      <Heading>GPT&D&D</Heading>
      <Text>Welcome to endless roleplaying</Text>
      <Text>
        Click the button below to enter a room. Share the room code with others
        to play together
      </Text>
      <Button onClick={handleStartSession}>Start Playing</Button>
    </Box>
  )
}
