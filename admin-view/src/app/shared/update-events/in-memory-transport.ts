// Part of the update-events module; keep identical in every client (see update-events.ts).
import { UpdateEvent, UpdateTopic, UpdateTransport, UpdateTransportListener } from './update-events';

/**
 * The test adapter: a broker in memory. [connect] connects at once; [publish] delivers to the
 * subscribed Topics while connected; [drop] and [reconnect] simulate a lost connection.
 */
export class InMemoryUpdateTransport implements UpdateTransport {
  topics: UpdateTopic[] = [];
  private listener?: UpdateTransportListener;
  private online = false;

  connect(topics: UpdateTopic[], listener: UpdateTransportListener): () => void {
    this.topics = topics;
    this.listener = listener;
    this.reconnect();
    return () => {
      this.online = false;
      this.listener = undefined;
    };
  }

  publish(topic: UpdateTopic, event: UpdateEvent): void {
    if (this.online && this.topics.includes(topic)) {
      this.listener?.event(topic, event);
    }
  }

  /** Loses the connection; events published until [reconnect] are lost, as with the real broker. */
  drop(reason?: unknown): void {
    this.online = false;
    this.listener?.disconnected(reason);
  }

  reconnect(): void {
    if (this.listener) {
      this.online = true;
      this.listener.connected();
    }
  }
}
