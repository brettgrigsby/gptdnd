import { continueConversation } from "@/utils/openai"
import { pusher } from "@/utils/pusher"
import { getMessages, sendMessage } from "@/utils/redis"
import type { NextApiRequest, NextApiResponse } from "next"

type Data = {
  success: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { message: rawMessage, roomId } = req.body
    const message = `Player: ${rawMessage}`

    await sendMessage({ message, roomId })
    await pusher.trigger(`room-${roomId}`, "new-message", {
      message,
    })

    const previousMessages = await getMessages(roomId)
    const aiMessage = await continueConversation({ previousMessages })
    if (!aiMessage) throw new Error("No response from OpenAI")

    await sendMessage({ message: aiMessage, roomId })
    await pusher.trigger(`room-${roomId}`, "new-message", {
      message: aiMessage,
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    //@ts-ignore
    res.status(500).json({ text: (err?.response?.data?.error || "") as string })
  }
}
