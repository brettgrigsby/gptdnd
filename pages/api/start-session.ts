import type { NextApiRequest, NextApiResponse } from "next"
import { openai } from "@/utils/openai"

type Data = {
  text: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { location } = req.body
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Describe a ${location}`,
    temperature: 0.9,
    max_tokens: 1000,
  })

  const text = response.data.choices[0].text?.trim() || ""

  res.status(200).json({ text })
}
