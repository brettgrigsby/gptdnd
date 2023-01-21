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
  useState,
} from "react"

export default function Room() {
  const router = useRouter()
  const { id } = router.query
  const [pusher, setPusher] = useState<Pusher | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [message, setMessage] = useState("")

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
      }),
    })

    setMessage("")
  }

  const handleGetMessages = useCallback(async () => {
    if (!id) return

    const response = await fetch("/api/get-messages?roomId=" + id).then((res) =>
      res.json()
    )

    if (response.messages) {
      setMessages(response.messages)
    }
  }, [id])

  useEffect(() => {
    handleGetMessages()
  }, [handleGetMessages])

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
      {messages.map((message) => (
        <Text key={message} mb={4}>
          {message}
        </Text>
      ))}
      <Box
        mb={"300px"}
        position="sticky"
        bottom={6}
        bgColor="blackAlpha.800"
        zIndex={1}
      >
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Input value={message} onChange={handleMessageChange} />
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
