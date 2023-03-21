import type { NextApiRequest, NextApiResponse } from "next"
import type { Character } from "@/types"
import { addCharacter, getMessages, getCharacters } from "@/utils/redis"
import { ChatCompletionResponseMessage } from "openai"

type Data = {
  messages: ChatCompletionResponseMessage[]
  characters: Character[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { roomId, character } = req.body

    if (!roomId) throw new Error("Room ID is required")
    if (Array.isArray(roomId)) throw new Error("Room ID must be a string")

    await addCharacter({ character, roomId })
    const characters = await getCharacters(roomId)
    const messages = await getMessages(roomId)

    res.status(200).json({ messages, characters })
  } catch (err) {
    //@ts-ignore
    res.status(500).json({ text: (err?.response?.data?.error || "") as string })
  }
}
