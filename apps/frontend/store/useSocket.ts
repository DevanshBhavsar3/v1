import { Socket } from "socket.io-client"
import { create } from "zustand"

type State = {
  socket: Socket | null
}

type Action = {
  setSocket: (socket: Socket) => void
}

export const useSocket = create<State & Action>((set) => ({
  socket: null,
  setSocket: (socket: Socket) => set(() => ({ socket: socket }))
}))
