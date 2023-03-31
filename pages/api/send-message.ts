import { continueConversation } from "@/utils/openai"
import { pusher } from "@/utils/pusher"
import { getMessages, sendMessage, getCharacters } from "@/utils/redis"
import type { NextApiRequest, NextApiResponse } from "next"
import { ChatCompletionResponseMessage } from "openai"

type Data = {
  success: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { message: rawMessage, roomId, characterName } = req.body
    const message: ChatCompletionResponseMessage = {
      role: "user",
      content: `${characterName}: ${rawMessage}`,
    }

    await sendMessage({
      message,
      roomId,
    })

    await pusher.trigger(`room-${roomId}`, "new-message", {
      message,
    })

    res.status(200).json({ success: true })

    const previousMessages = await getMessages(roomId)
    console.log({ previousMessages: previousMessages.length })
    const characters = await getCharacters(roomId)
    console.log({ characters: characters.length })
    const aiMessage = await continueConversation({
      previousMessages,
      characters,
    })
    if (!aiMessage) {
      console.error(`No response from OpenAI`)
      throw new Error("No response from OpenAI")
    }

    await sendMessage({ message: aiMessage, roomId })
    await pusher.trigger(`room-${roomId}`, "new-message", {
      message: aiMessage,
    })
  } catch (err) {
    console.error(err)
    //@ts-ignore
    res.status(500).json({ text: (err?.response?.data?.error || "") as string })
  }
}
