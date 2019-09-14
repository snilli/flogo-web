import * as socketio from 'socket.io';
import { EngineLogStreamer } from './engine-log-streamer';
import { StreamSimulator, SimulationClient } from '../../modules/simulator';

// TODO: inject config
export function init(server, { streamSimulator }: { streamSimulator: StreamSimulator }) {
  const wsServer: socketio.Server = require('socket.io')(server);
  const sockets = new Set<socketio.Socket>();
  const engineLogStreamer = new EngineLogStreamer(wsServer);

  wsServer.on('connection', (ws: socketio.Socket) => {
    engineLogStreamer.registerClient(ws);

    sockets.add(ws);
    ws.on('disconnect', () => {
      sockets.delete(ws);
    });
  });

  let closed = false;
  server.on('close', () => {
    if (closed) {
      return;
    }
    closed = true;
    wsServer.close();
    sockets.forEach(socket => socket.disconnect(true));
    sockets.clear();
  });

  wsServer.of('/stream-simulator').on('connection', clientSocket => {
    streamSimulator.updateClient(new SimulationClient(clientSocket));
  });
}
