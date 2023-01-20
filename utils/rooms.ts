type Room = {
  id: string
  messages: string[]
}

function create4CharacterRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

class RoomsManager {
  private rooms: Room[] = []

  public createRoom(): Room {
    const id = create4CharacterRoomCode()
    const room = { id, messages: [] }
    this.rooms.push(room)
    return room
  }

  public getRoom(id: string) {
    return this.rooms.find((room) => room.id === id)
  }

  public getRoomIds() {
    return this.rooms.map((room) => room.id)
  }
}

export const roomsManager = new RoomsManager()
