import type { NextApiRequest, NextApiResponse } from "next"
import { continueConversation } from "@/utils/openai"

type Data = {
  text: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { previousMessages } = req.body

    const response = await continueConversation({
      previousMessages: previousMessages.slice(-6) || [],
    })

    res.status(200).json({ text: response || "" })
  } catch (err) {
    //@ts-ignore
    res.status(500).json({ text: (err?.response?.data?.error || "") as string })
  }
}
