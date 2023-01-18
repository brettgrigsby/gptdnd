import { useState } from "react"

export default function StartSession() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState<string>("")

  const handleStart = async () => {
    console.log("start")
    const resp = await fetch("/api/start-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: "cyberpunk city street",
      }),
    }).then((r) => r.json())
    if (resp.text)
      setMessages((prev) => [...prev, `Dungeon Master: ${resp.text}`])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

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
  }

  return (
    <div style={{ padding: 10 }}>
      <h1>Start Session</h1>
      <button onClick={handleStart}>START</button>
      <br />
      {messages.map((m) => (
        <p key={m} style={{ marginBottom: 10 }}>
          {m}
        </p>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleChange} type="text" />
        <button type="submit">SUBMIT</button>
      </form>
    </div>
  )
}
