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
    <div>
      <h2 style={{ textAlign: "center", margin: "10px 0" }}>
        {((id as string) || "").toUpperCase()}
      </h2>
      <p style={{ marginBottom: 10 }}>
        Dungeon Master: You start out into the city on your own. There are many
        opportunities for work, adventures, profit and trouble.
      </p>
      {messages.map((message) => (
        <p key={message} style={{ marginBottom: 10 }}>
          {message}
        </p>
      ))}
      <form onSubmit={handleSubmit}>
        <input type="text" value={message} onChange={handleMessageChange} />
        <button type="submit">Send Message</button>
      </form>
    </div>
  )
}
