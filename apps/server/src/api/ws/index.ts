import * as socketio from 'socket.io';
import { EngineLogStreamer } from './engine-log-streamer';

// TODO: inject config
export function init(server) {
  const wsServer: socketio.Server = require('socket.io')(server);
  const sockets = new Set<socketio.Socket>();
  const engineLogStreamer = new EngineLogStreamer(wsServer);

  wsServer.on('connection', (ws: socketio.Socket) => {
    engineLogStreamer.registerClient(ws);

    sockets.add(ws);
    ws.on('close', () => {
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
}
