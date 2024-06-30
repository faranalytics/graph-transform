/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { Transform, ObjectToBuffer, BufferToObject, ConsoleHandler, SocketHandler} from 'graph-transform';

class Greeter {
    public greeting: string = '0'.repeat(16);
}

async function test1() {

    // const objectToBuffer = new ObjectToBuffer<Greeter>();
    // const bufferToObject = new BufferToObject<Greeter>();
    const consoleHandler = new ConsoleHandler();

    net.createServer((socket: net.Socket) => {
        const socketHandler1 = new SocketHandler<Greeter, Greeter>(socket);
        const socketHandler2 = new SocketHandler<Greeter, Greeter>(socket);

        socketHandler1.connect(socketHandler2);

    }).listen(3000);
    const socket = net.createConnection({ port: 3000 });
    await new Promise((r, e) => socket.once('connect', r).once('error', e));
    // const socketHandler = new Transform<Buffer, Buffer>(socket);

    // const transform =
    //     objectToBuffer.connect(
    //         socketHandler.connect(
    //             bufferToObject.connect(
    //                 consoleHandler
    //             )
    //         )
    //     );

    const socketHandler = new SocketHandler<Greeter, Greeter>(socket);

    const transform = socketHandler.connect(
        consoleHandler
    );


    transform.write(new Greeter());
    transform.write(new Greeter());
}

function main() {
    test1();
}

main();

function test (a:unknown) {

}

test(1);