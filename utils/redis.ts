import Redis from "ioredis"
import type { Character } from "@/types"

async function getRedis() {
  const redis = new Redis(process.env.REDIS_URL || "")

  return redis
}

type SendMessageParams = {
  message: string
  roomId: string
}

async function sendMessage({ message, roomId }: SendMessageParams) {
  const redis = await getRedis()
  await redis.rpush(`${roomId}-messages`, message)
  await redis.disconnect()
}

async function getMessages(roomId: string): Promise<string[]> {
  const redis = await getRedis()
  const messages = await redis.lrange(`${roomId}-messages`, 0, -1)
  await redis.disconnect()
  return messages
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
