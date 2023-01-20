import { useRouter } from "next/router"
import { roomsManager } from "@/utils/rooms"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "../../components/loading-spinner"
import Pusher from "pusher-js"

export default function Room() {
  const router = useRouter()
  const { id } = router.query
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const room = roomsManager.getRoom(id as string)
  const started = room?.messages.length
  const [pusher, setPusher] = useState<Pusher | null>(null)

  useEffect(() => {
    if (!pusher) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
      })
      setPusher(pusher)
    }
    return () => setPusher(null)
  }, [pusher])

  useEffect(() => {
    if (pusher) {
      const channel = pusher.subscribe(`room-${id}`)
      channel.bind("message", (data: any) => {
        console.log({ data })
      })
    }
  }, [pusher, id])

  const handleStart = async (location: string) => {
    setLoading(true)
    const resp = await fetch("/api/start-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location,
      }),
    }).then((r) => r.json())
    if (resp.text) {
      setMessages((prev) => [...prev, `Dungeon Master: ${resp.text}`])
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    const newMessages = [...messages, `Player: ${input}`]
    setInput("")

    const resp = await fetch("/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        previousMessages: newMessages,
      }),
    }).then((r) => r.json())

    if (resp.text) setMessages([...newMessages, resp.text])
    setLoading(false)
  }

  return (
    <div style={{ padding: 10 }}>
      {started ? (
        <div>
          {messages.map((m) => (
            <p key={m} style={{ marginBottom: 10 }}>
              {m}
            </p>
          ))}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <form onSubmit={handleSubmit}>
              <input value={input} onChange={handleChange} type="text" />
              <button type="submit">SUBMIT</button>
            </form>
          )}
        </div>
      ) : (
        <>
          {loading && <LoadingSpinner />}
          {!loading && (
            <>
              <h1>Start Session</h1>
              <div style={{ display: "flex", padding: "10px 0px" }}>
                <button
                  style={{ marginRight: 10 }}
                  onClick={() => handleStart("fantasy forest")}
                >
                  Fantasy Forest
                </button>
                <button
                  style={{ marginRight: 10 }}
                  onClick={() => handleStart("cyberpunk city street")}
                >
                  Cyberpunk City
                </button>
                <button onClick={() => handleStart("star wars planet")}>
                  Star Wars Planet
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
