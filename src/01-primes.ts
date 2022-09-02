import * as  net from "net";
import {assertEqual, assertNumber} from "./utils";

export function run01(port: number) {
  const server = net.createServer();

  server.on('connection', primeTest);
  server.listen(port, () => {
    console.log(`server listening on ${port}`);
  })

  function primeTest(socket: net.Socket) {
    console.log(`Connection received from ${socket.remoteAddress}`);
    let existingData = '';
    socket.on('data', (data: Buffer) => {
      try {
        existingData += data.toString();
        console.log(existingData);
        const splits = existingData.split(/\r|\n/);
        for (let i = 0; i < splits.length - 1; i++) {
          const obj = JSON.parse(splits[i]) as { method: string, number: number };
          assertEqual(obj.method, 'isPrime');
          assertNumber(obj.number);

          socket.write(JSON.stringify({method: 'isPrime', prime: isPrime(obj.number)}) + "\n", console.error)
        }
        existingData = splits[splits.length - 1];
      } catch (error: any) {
        console.log(error);
        socket.write("Naughty naughty");
        socket.end();
      }
    })
    socket.on('close', () => socket.end())
  }
}

function isPrime(i: number): boolean {
  if (Math.round(i) !== i) {
    return false;
  }
  if (i <= 1) {
    return false;
  }
  if (i === 2) {
    return true;
  }
  for (let j = 2; j <= Math.ceil(Math.sqrt(i)); j++) {
    const r = i / j;
    if (Math.round(r) === r) {
      return false
    }
  }
  return true;
}