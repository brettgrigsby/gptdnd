import { Character } from "@/types"
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import Pusher from "pusher-js"
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useCookies } from "react-cookie"

export default function Room() {
  const router = useRouter()
  const { id } = router.query
  const [pusher, setPusher] = useState<Pusher | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [cookies] = useCookies(["gptndnd-character"])
  const [gameState, setGameState] = useState<string>("")

  const character: Character = useMemo(() => {
    return cookies["gptndnd-character"]
  }, [cookies])

  // set the pusher instance
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    })
    setPusher(pusher)
    return () => setPusher(null)
  }, [])

  // subscribe to the channel
  useEffect(() => {
    if (pusher && id) {
      const channel = pusher.subscribe(`room-${id}`)
      channel.bind("new-message", (data: any) => {
        if (data.message) {
          const split = data.message.split("GAME STATE: ")
          if (split[1]) {
            setGameState(split[1])
          }
          setMessages((messages) => [...messages, data.message])
        }
      })
    }
    return () => {
      if (pusher) {
        pusher.unsubscribe(`room-${id}`)
      }
    }
  }, [pusher, id])

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()

    if (!id || !message) return

    fetch("/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: id,
        message,
        characterName: character?.name || "Player",
      }),
    })

    setMessage("")
  }

  const handleJoinRoom = useCallback(async () => {
    if (!id) return

    const response: { messages: string[] } = await fetch("/api/join-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: id,
        character,
      }),
    }).then((res) => res.json())

    if (response.messages) {
      setMessages(response.messages)
      //@ts-ignore
      const latestGameState = response.messages
        .find((message) => message.includes("GAME STATE: "))
        .split("GAME STATE: ")[1]
      setGameState(latestGameState)
    }
  }, [id, character])

  useEffect(() => {
    handleJoinRoom()
  }, [handleJoinRoom])

  const handleMessageChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(e.target.value)
  }

  return (
    <Box
      margin="auto"
      maxWidth="720px"
      height="100vh"
      overflow="auto"
      position="relative"
      p={[2, null, null, 0]}
    >
      <Heading textAlign="center" position="sticky" top={0}>
        {((id as string) || "").toUpperCase()}
      </Heading>
      <Text mb={4}>
        Dungeon Master: You start out into the city on your own. There are many
        opportunities for work, adventures, profit and trouble.
      </Text>
      {messages.map((message) => {
        const split = message.split("GAME STATE: ")
        return (
          <Text key={message} mb={4}>
            {split[0]}
          </Text>
        )
      })}
      <Box mb={"300px"} position="sticky" bottom={6} zIndex={1}>
        <Text textAlign="center">{gameState}</Text>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              bgColor="whiteAlpha.800"
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
      </Box>
    </Box>
  )
}
