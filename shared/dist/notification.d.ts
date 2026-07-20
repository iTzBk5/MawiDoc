export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    isRead: boolean;
    createdAt: Date;
}
export interface FCMToken {
    id: string;
    userId: string;
    token: string;
    platform: string;
    createdAt: Date;
}
