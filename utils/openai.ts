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
  const previousString: string = previousMessages.slice(-10).join("\n")
  const firstCharacterName = characters[0]?.name || "${firstCharacterName}"
  const prompt = `
You are the Dungeon Master for the following players:
${characters
  .map((char) => `${char.name} a ${char.race} ${char.class}`)
  .join(", and ")}

Here are some examples of how you might respond with a message and Game State for a player's action:

${firstCharacterName}: I search the corridor for enemies.

Dungeon Master: As you search the corridor, you notice a 2 goblins hiding behind a barrel holding a mace.
GAME STATE: Location: Dungeon Corridor, Enemies: 2 Goblins

${firstCharacterName}: I strike one of the goblins with my sword and succeed.

Dungeon Master: Your blade slices into the goblin's right arm and he drops his rusty mace.
GAME STATE: Location: Dungeon Corridor, Enemies: a Goblin and a wounded Goblin

${firstCharacterName}: Can I build a machine gun?

Dungeon Master: You lack the knowledge to build a machine gun and while you ponder it, the goblins escape.
GAME STATE: Location: Dungeon Corridor, Enemies: none

${firstCharacterName}: I go through the door at the end of the corridor.

Dungeon Master: You emerge into a large cavern with an idol in the center.
GAME STATE: Location: Large Cavern, Enemies: none

Now complete the following:

Dungeon Master: You start out into the city on your own. There are many opportunities for work, adventures, profit and trouble.
GAME STATE: Location: City Street, Enemies: none
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
