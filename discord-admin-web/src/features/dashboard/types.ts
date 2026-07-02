export interface CommandLog {
  id: number;
  interactionId: string;
  commandName: string;
  userId: string;
  channelId: string;
  status: string;
  aiAnalysis?: string;
  createdAt: string;
  payload: any;
}

export interface CommandConfig {
  command: string;
  isEnabled: boolean;
  replyText: string | null;
  systemPrompt: string | null;
}
