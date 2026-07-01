import { Server } from "socket.io"

export const io = new Server()

type SocketDataUser = {
	id: string
	email: string
}

export const isSocketOwnedByUser = (socketId: string, userId: string): boolean => {
	const socket = io.sockets.sockets.get(socketId)
	const socketUser = socket?.data?.user as SocketDataUser | undefined
	return !!socketUser && socketUser.id === userId
}
