import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(configuration)

export async function continueConversation({
  previousMessages,
}: {
  previousMessages: string[]
}) {
  const previousString: string = previousMessages.join(" ")
  const prompt = `
You are a dungeon master for a group of players. They will provide actions and you will continue their story without saying what actions the players take.

${previousString}
`
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.9,
    max_tokens: 2000,
  })

  return response.data.choices[0].text?.trim()
}
