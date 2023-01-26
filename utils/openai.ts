import { Character } from "@/types"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(configuration)

export async function continueConversation({
  previousMessages,
  characters,
}: {
  previousMessages: string[]
  characters: Character[]
}) {
  const previousString: string = previousMessages.slice(-10).join(" ")
  const prompt = `
You are the Dungeon Master for the following players:
${characters
  .map((char) => `${char.name} a ${char.race} ${char.class}`)
  .join(", and ")}

Here are some examples of how you might response to a player's action:

Grumby: I strike the goblin with my sword and succeed.
Dungeon Master: Your blade slices into the goblin's right arm and he drops his rusty mace.

Grumby: Can I build a machine gun?
Dungeon Master: You lack the knowledge of how to build a machine gun.

Grumby: I talk to the barkeep.
Dungeon Master: The barkeep says, "Welcome to the tavern. What can I get you?"

Grumby: I attempt to seduce the barkeep, but fail.
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
