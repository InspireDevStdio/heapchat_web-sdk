declare interface HeapChatConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
}

declare class HeapChat {
  constructor(config: HeapChatConfig);
  show(): void;
  hide(): void;
  destroy(): void;
}

export default HeapChat; 