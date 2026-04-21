/**
 * Real-time HCS Event Streaming
 * WebSocket/SSE for Hedera Consensus Service events
 */

import { getHederaConfig } from '../hedera/config';

export type HCSEventType =
    | 'certificate.issued'
    | 'certificate.claimed'
    | 'certificate.revoked'
    | 'did.created'
    | 'topic.message';

export interface HCSEvent {
    type: HCSEventType;
    topicId: string;
    sequenceNumber: string;
    consensusTimestamp: string;
    message: any;
    transactionId?: string;
}

type EventCallback = (event: HCSEvent) => void;

export class HCSEventStream {
    private static instance: HCSEventStream;
    private eventSource: EventSource | null = null;
    private listeners: Map<string, Set<EventCallback>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isConnecting = false;

    private constructor() { }

    static getInstance(): HCSEventStream {
        if (!HCSEventStream.instance) {
            HCSEventStream.instance = new HCSEventStream();
        }
        return HCSEventStream.instance;
    }

    /**
     * Connect to HCS event stream
     */
    connect(topicId?: string): void {
        if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
            console.log('Already connected or connecting to HCS event stream');
            return;
        }

        this.isConnecting = true;

        try {
            const { network, mirrorNodeUrl } = getHederaConfig();

            // In production, this would connect to your backend SSE endpoint
            // that subscribes to the Hedera Mirror Node
            const streamUrl = topicId
                ? `/api/hcs/stream?topicId=${topicId}&network=${network}`
                : `/api/hcs/stream?network=${network}`;

            console.log('Connecting to HCS event stream:', streamUrl);

            this.eventSource = new EventSource(streamUrl);

            this.eventSource.onopen = () => {
                console.log('HCS event stream connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const hcsEvent: HCSEvent = JSON.parse(event.data);
                    this.dispatchEvent(hcsEvent);
                } catch (error) {
                    console.error('Failed to parse HCS event:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('HCS event stream error:', error);
                this.isConnecting = false;
                this.handleReconnect();
            };
        } catch (error) {
            console.error('Failed to connect to HCS event stream:', error);
            this.isConnecting = false;
            this.handleReconnect();
        }
    }

    /**
     * Disconnect from HCS event stream
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log('Disconnected from HCS event stream');
    }

    /**
     * Subscribe to HCS events
     */
    subscribe(eventType: HCSEventType | '*', callback: EventCallback): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }

        this.listeners.get(eventType)!.add(callback);

        // Auto-connect if not already connected
        if (!this.eventSource) {
            this.connect();
        }

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(eventType);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(eventType);
                }
            }
        };
    }

    /**
     * Dispatch event to listeners
     */
    private dispatchEvent(event: HCSEvent): void {
        // Notify specific event listeners
        const specificListeners = this.listeners.get(event.type);
        if (specificListeners) {
            specificListeners.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }

        // Notify wildcard listeners
        const wildcardListeners = this.listeners.get('*');
        if (wildcardListeners) {
            wildcardListeners.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Error in wildcard listener:', error);
                }
            });
        }
    }

    /**
     * Handle reconnection logic
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN;
    }

    /**
     * Get connection state
     */
    getState(): 'connecting' | 'open' | 'closed' {
        if (!this.eventSource) return 'closed';

        switch (this.eventSource.readyState) {
            case EventSource.CONNECTING:
                return 'connecting';
            case EventSource.OPEN:
                return 'open';
            case EventSource.CLOSED:
                return 'closed';
            default:
                return 'closed';
        }
    }
}

// Export singleton instance
export const hcsEventStream = HCSEventStream.getInstance();

/**
 * React Hook for HCS events
 */
export function useHCSEvents(
    eventType: HCSEventType | '*',
    callback: EventCallback,
    enabled: boolean = true
) {
    if (typeof window === 'undefined') return;

    const stream = HCSEventStream.getInstance();

    if (enabled) {
        const unsubscribe = stream.subscribe(eventType, callback);

        // Cleanup on unmount
        return () => {
            unsubscribe();
        };
    }
}
