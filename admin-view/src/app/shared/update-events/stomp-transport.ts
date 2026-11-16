// Part of the update-events module; keep identical in every client (see update-events.ts).
import { Client, IMessage } from '@stomp/stompjs';
import { parseUpdateEvent, UpdateTopic, UpdateTransport, UpdateTransportListener } from './update-events';

/** The broker endpoint on the host serving the client (proxied to the backend). */
export function defaultBrokerUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  return `${protocol}${window.location.host}/ttt-websocket`;
}

/** The production adapter: STOMP over a native WebSocket (ADR 0002), reconnecting every 5 s. */
export class StompUpdateTransport implements UpdateTransport {
  constructor(private readonly brokerUrl: string = defaultBrokerUrl()) {}

  connect(topics: UpdateTopic[], listener: UpdateTransportListener): () => void {
    const client = new Client({
      brokerURL: this.brokerUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // subscriptions do not survive a reconnect, so they are created on every connect
        topics.forEach((topic) =>
          client.subscribe(`/topic/${topic}`, (message: IMessage) => {
            const event = parseUpdateEvent(message.body);
            if (event) {
              listener.event(topic, event);
            } else {
              console.error('ignoring malformed update event', message.body);
            }
          })
        );
        listener.connected();
      },
      onStompError: (frame) => {
        console.error('stomp error', frame);
        listener.disconnected(frame);
      },
      onWebSocketClose: (event) => listener.disconnected(event),
    });
    client.activate();
    return () => void client.deactivate();
  }
}
