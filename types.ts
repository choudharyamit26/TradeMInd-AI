export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean; // To show a specific state if we were parsing thoughts, simpler for now
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}