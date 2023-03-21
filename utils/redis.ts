import Redis from "ioredis"
import type { Character } from "@/types"
import { ChatCompletionResponseMessage } from "openai"

async function getRedis() {
  const redis = new Redis(process.env.REDIS_URL || "")

  return redis
}

type SendMessageParams = {
  message: ChatCompletionResponseMessage
  roomId: string
}

async function sendMessage({ message, roomId }: SendMessageParams) {
  const redis = await getRedis()
  await redis.rpush(`${roomId}-messages`, JSON.stringify(message))
  await redis.disconnect()
}

async function getMessages(
  roomId: string
): Promise<ChatCompletionResponseMessage[]> {
  const redis = await getRedis()
  const messages = await redis.lrange(`${roomId}-messages`, 0, -1)
  await redis.disconnect()
  return messages.map((msg) => JSON.parse(msg))
}

async function getCharacters(roomId: string): Promise<Character[]> {
  const redis = await getRedis()
  const characters = await redis.smembers(`${roomId}-characters`)
  await redis.disconnect()
  return characters.map((char) => JSON.parse(char))
}

async function addCharacter({
  character,
  roomId,
}: {
  character: Character
  roomId: string
}) {
  const redis = await getRedis()
  await redis.sadd(`${roomId}-characters`, JSON.stringify(character))
  await redis.disconnect()
}

export { sendMessage, getMessages, addCharacter, getCharacters }
