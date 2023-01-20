import { pusher } from "@/utils/pusher"
import { sendMessage } from "@/utils/redis"
import type { NextApiRequest, NextApiResponse } from "next"

type Data = {
  success: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { message, roomId } = req.body

    await sendMessage({ message, roomId })
    await pusher.trigger(`room-${roomId}`, "new-message", {
      message,
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    //@ts-ignore
    res.status(500).json({ text: (err?.response?.data?.error || "") as string })
  }
}
