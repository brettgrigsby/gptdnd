import type { NextApiRequest, NextApiResponse } from "next"
import { continueConversation } from "@/utils/openai"
import { getMessages } from "@/utils/redis"

type Data = {
  messages: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { roomId } = req.query

    if (!roomId) throw new Error("Room ID is required")
    if (Array.isArray(roomId)) throw new Error("Room ID must be a string")

    const messages = await getMessages(roomId)

    res.status(200).json({ messages })
  } catch (err) {
    //@ts-ignore
    res.status(500).json({ text: (err?.response?.data?.error || "") as string })
  }
}
