import * as socketio from 'socket.io';
import { engineLogger } from '../../common/logging';

export class EngineLogStreamer {
  private cleanup: Function;
  private readonly firstConnectionQuery = {
    limit: 10,
    start: 0,
    order: 'desc' as 'desc',
    fields: ['level', 'timestamp', 'message'],
  };

  constructor(private server: socketio.Server) {}

  init() {
    const logStreamListener = logData => {
      this.server.emit(
        'on-log',
        JSON.stringify({
          level: logData.level,
          message: logData.message,
          timestamp: logData.timestamp,
        })
      );
    };
    const logStream = engineLogger.stream({ start: -1 });
    logStream.on('log', logStreamListener);
    this.cleanup = () => logStream.removeListener('log', logStreamListener);
  }

  registerClient(client: socketio.Socket) {
    engineLogger.query(this.firstConnectionQuery, (err, results) => {
      if (err) {
        console.log(err);
      }
      const docs = results['file'] || [];
      client.emit('on-connecting', JSON.stringify(docs));
    });
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}
