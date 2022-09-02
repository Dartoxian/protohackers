import * as  net from "net";

export function run00(port: number) {
  const server = net.createServer();

  server.on('connection', tcpEcho);
  server.listen(port, () => {
    console.log(`server listening on ${port}`);
  })

  function tcpEcho(socket: net.Socket) {
    console.log(`Connection received from ${socket.remoteAddress}`)
    socket.on('data', (data: Buffer) => socket.write(data, console.error))
    socket.on('close', () => socket.end())
  }
}