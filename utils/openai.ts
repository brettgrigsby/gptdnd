import { Character } from "@/types"
import { ChatCompletionResponseMessage, Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = new OpenAIApi(configuration)

export async function continueConversation({
  previousMessages,
  characters,
}: {
  previousMessages: ChatCompletionResponseMessage[]
  characters: Character[]
}) {
  const firstCharacterName = characters[0]?.name || "${firstCharacterName}"

  const systemContent = `
  You are a Dungeon Master for a group of players.

  The players are:
  ${characters
    .map((char) => `${char.name} a ${char.race} ${char.class}`)
    .join(", and ")}

  You will respond to the players' actions with a description of the results and the game state.

  The game state consists of the following:
    - Location
    - Enemies
  
  Here are some examples of how you might respond with a message and Game State for a player's action:

  ${firstCharacterName}: I search the corridor for enemies.
  You search the corridor and notice a 2 goblins hiding behind a barrel holding a mace.
  GAME STATE: Location: Dungeon Corridor, Enemies: 2 Goblins

  ${firstCharacterName}: I strike one of the goblins with my sword and succeed.
  Your blade slices into the goblin's right arm and he drops his rusty mace.
  GAME STATE: Location: Dungeon Corridor, Enemies: a Goblin and a wounded Goblin

  ${firstCharacterName}: Can I build a machine gun?
  You lack the knowledge to build a machine gun and while you ponder it, the goblins escape.
  GAME STATE: Location: Dungeon Corridor, Enemies: none

  ${firstCharacterName}: I go through the door at the end of the corridor.
  You emerge into a large cavern with an idol in the center.
  GAME STATE: Location: Large Cavern, Enemies: none
  `

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: systemContent,
      },
      {
        role: "assistant",
        content:
          "You start out into the city on your own. There are many opportunities for work, adventures, profit and trouble.",
      },
      ...previousMessages,
    ],
  })

  return response.data.choices[0].message
}
