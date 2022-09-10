import * as  net from "net";
import {assertEqual, assertNumber} from "./utils";

export function run02(port: number) {
  const server = net.createServer();

  server.on('connection', trackMean);
  server.listen(port, () => {
    console.log(`server listening on ${port}`);
  })

  function trackMean(socket: net.Socket) {
    console.log(`Connection received from ${socket.remoteAddress}`);
    const datapoints = [];
    let currentMessage = [];
    socket.on('data', (data: Buffer) => {
      for (const byte of data) {
        currentMessage.push(byte);
      }
      while (currentMessage.length >= 9) {
        const completeMessage = currentMessage.slice(0, 9);
        currentMessage = currentMessage.slice(9)

        try {
          const char = String.fromCharCode(completeMessage[0]);
          if (char === 'I') {
            datapoints.push({
              value: fromInt32(completeMessage.slice(5, 9)),
              timestamp: fromInt32(completeMessage.slice(1, 5))
            });
          } else if (char === 'Q') {
            const minT = fromInt32(completeMessage.slice(1, 5));
            const maxT = fromInt32(completeMessage.slice(5, 9));
            const matchingData = datapoints
                .filter(({timestamp}) => timestamp >= minT)
                .filter(({timestamp}) => timestamp <= maxT);
            const sum = matchingData.reduce((acc, {value}) => acc + value, 0);
            const mean = Math.floor(matchingData.length === 0 ? 0 : sum / matchingData.length);
            socket.write(toInt32(mean));
          } else {
            throw new Error(`Unrecognised operation ${char}`)
          }
        } catch (error: any) {
          console.log(error);
          socket.write("Naughty naughty");
          socket.end();
        }
      }
    })
    socket.on('close', () => socket.end())
  }
}

function fromInt32(bytes: number[]) {
  const raw =  bytes.reduce((acc, b) => (acc << 8) + b, 0);
  if (raw >> (bytes.length * 8) - 1 === 1) {
    return ~(raw -1);
  } else {
    return raw
  }
}

function toInt32(val: number): Uint8Array {
  const byteArray = new Uint8Array(4);

  for (let index = 0; index < byteArray.length; index++) {
    const byte = val & 0xff;
    byteArray[byteArray.length - index - 1] = byte;
    val = (val - byte) / 256;
  }
  return byteArray;
}