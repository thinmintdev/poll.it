import { Server } from 'socket.io'
import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/types/socket'

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-poll', (pollId: string) => {
        socket.join(`poll-${pollId}`)
        console.log(`Client ${socket.id} joined poll ${pollId}`)
      })

      socket.on('leave-poll', (pollId: string) => {
        socket.leave(`poll-${pollId}`)
        console.log(`Client ${socket.id} left poll ${pollId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  res.end()
}
