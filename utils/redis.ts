import Redis from "ioredis"

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

export { sendMessage, getMessages }
