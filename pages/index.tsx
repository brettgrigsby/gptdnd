import { useState } from "react"
import { LoadingSpinner } from "./components/loading-spinner"

export default function StartSession() {
  const [started, setStarted] = useState<boolean>(false)
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleStart = async () => {
    setStarted(true)
    setLoading(true)
    const resp = await fetch("/api/start-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: "cyberpunk city street",
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
          <h1>Start Session</h1>
          <button onClick={handleStart}>START</button>
        </>
      )}
    </div>
  )
}
