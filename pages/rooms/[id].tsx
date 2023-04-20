import { CharacterSelection } from "@/components/chracter-selection"
import { NotFound } from "@/components/not-found"
import { Character } from "@/types"
import {
  Box,
  Button,
  Drawer,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useDisclosure,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { ChatCompletionResponseMessage } from "openai"
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"

export default function Room() {
  const router = useRouter()
  const { id } = router.query
  const [socketUrl, setSocketUrl] = useState<string | null>(null)
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl)
  const [messages, setMessages] = useState<
    ChatCompletionResponseMessage[] | null
  >([])
  const [message, setMessage] = useState("")
  const [players, setPlayers] = useState<{ name: string }[]>([])
  const [gameState, setGameState] = useState<{
    Location: string
    Enemies: string[]
  }>({
    Location: "",
    Enemies: [],
  })
  const joinDisclosure = useDisclosure()
  const roomInfoDisclosure = useDisclosure()

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()

    if (!id || !message || readyState !== ReadyState.OPEN) return

    sendMessage(message)
    // use websocket connection to send message

    // fetch("/api/send-message", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     roomId: id,
    //     message,
    //     userId: "testuserid",
    //   }),
    // })

    setMessage("")
  }

  useEffect(() => {
    if (!lastMessage) return

    const data: ChatCompletionResponseMessage = JSON.parse(lastMessage.data)

    if (messages && messages[messages?.length - 1]?.content !== data.content) {
      setMessages((prev) => [...(prev || []), data])
    }
  }, [lastMessage, messages])

  useEffect(() => {
    if (!messages) return

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return

    const split = lastMessage.content.split("GAME STATE: ")
    if (split.length > 1) {
      setGameState(JSON.parse(split[1]))
    }
  }, [messages])

  const handleJoinRoom = useCallback(
    async (char: Character) => {
      if (!id) return

      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
      if (!serverUrl) return

      const resp = await fetch(`${serverUrl}/rooms/${id}/join`, {
        method: "POST",
        body: JSON.stringify({
          name: char.name,
        }),
      }).then((res) => res.json())

      if (resp?.id) {
        // setSocketUrl(
        //   `ws://pure-spire-81282.herokuapp.com//rooms/${id}/players/${resp.id}/ws`
        // )
        setSocketUrl(`ws://localhost:8080/rooms/${id}/players/${resp.id}/ws`)
      }
    },
    [id]
  )

  const handleMessageChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(e.target.value)
  }

  useEffect(() => {
    if (!id) return

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    if (!serverUrl) return

    fetch(`${serverUrl}/rooms/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setMessages(data.messages)
          setPlayers(data.players)
        }
      })
      .catch((err) => setMessages(null))
  }, [id])

  const hasJoined = !!socketUrl
  // add modal that is open until user chooses character
  // do not show input until user joins room

  if (!messages) {
    return <NotFound />
  }

  return (
    <>
      <Drawer
        isOpen={roomInfoDisclosure.isOpen}
        placement="top"
        onClose={roomInfoDisclosure.onClose}
        size="full"
      >
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Heading textAlign="center">Players</Heading>
          </DrawerHeader>
          <DrawerBody>
            {players.map((player) => (
              <Text key={player.name}>{player.name}</Text>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Box
        margin="auto"
        maxWidth="720px"
        height="100vh"
        overflow="auto"
        position="relative"
        p={[2, null, null, 0]}
      >
        <Heading textAlign="center" position="sticky" top={0} mb={2}>
          <Text
            w="fit-content"
            mx="auto"
            px={3}
            bgColor="blackAlpha.800"
            borderRadius="md"
            onClick={roomInfoDisclosure.onOpen}
          >
            {((id as string) || "").toUpperCase()}
          </Text>
        </Heading>
        {!hasJoined && (
          <Button w="full" my={2} onClick={joinDisclosure.onOpen}>
            Join Adventure
          </Button>
        )}
        {messages.map((message, idx) => {
          const split = message.content.split("GAME STATE: ")
          const key = `${idx}-${message.content.substring(0, 15)}`
          return (
            <Text key={idx} mb={4}>
              {message.role === "assistant" && "Dungeon Master: "}
              {split[0]}
            </Text>
          )
        })}
        <Box
          mb={"300px"}
          position={hasJoined ? "sticky" : "initial"}
          bottom={6}
          zIndex={1}
        >
          {(gameState.Location || gameState.Enemies.length > 0) && (
            <Box bgColor={"blackAlpha.900"} p={2} mb={2} borderRadius="md">
              <Text textAlign="center" fontSize="2xs" mt={-1}>
                Game State
              </Text>
              <Flex justify="space-around">
                {gameState.Location && (
                  <Text fontSize="sm" textAlign="center">
                    Location: {gameState.Location}
                  </Text>
                )}
                {gameState.Enemies.length > 0 && (
                  <Text fontSize="sm" textAlign="center">
                    Enemies: {gameState.Enemies.join(", ")}
                  </Text>
                )}
              </Flex>
            </Box>
          )}
          {hasJoined && (
            <form onSubmit={handleSubmit}>
              <InputGroup>
                <Input
                  bgColor="blackAlpha.800"
                  value={message}
                  onChange={handleMessageChange}
                />
                <InputRightElement w="fit-content" p={1}>
                  <Button size="sm" type="submit">
                    Send
                  </Button>
                </InputRightElement>
              </InputGroup>
            </form>
          )}
          {!hasJoined && messages.length > 5 && (
            <Button w="full" my={2} onClick={joinDisclosure.onOpen}>
              Join Adventure
            </Button>
          )}
        </Box>
      </Box>
      <CharacterSelection {...joinDisclosure} onSubmit={handleJoinRoom} />
    </>
  )
}
