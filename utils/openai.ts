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
  const previousString: string = previousMessages.slice(-20).join(" ")
  const prompt = `
You are a dungeon master for a group of players. Choose outcomes for their prompts without taking action on their behalf.

Player: I strike the goblin with my sword and succeed.
Dungeon Master: Your blade slices into the goblin's right arm and he drops his rusty mace.
Player: Can I build a machine gun?
Dungeon Master: You lack the knowledge of how to build a machine gun.
Player: I talk to the barkeep.
Dungeon Master: The barkeep says, "Welcome to the tavern. What can I get you?"
Player: I attempt to seduce the barkeep, but fail.
Dungeon Master: The barkeep rebukes your advances and says "Maybe you should look for drinks somewhere else."

Dungeon Master: You start out into the city on your own. There are many opportunities for work, adventures, profit and trouble.
${previousString}
`
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    max_tokens: 2000,
  })

  return response.data.choices[0].text?.trim()
}
