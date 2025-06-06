export enum Position {
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left'
}

export type HeapchatConfig = {
  apiKey: string;
  position?: Position;
  supportImage?: string;
}

export type CustomerDataModel = {
  name?: string;
  email?: string;
  phone?: string;
}

interface QueuedMessage {
  type: string;
  payload: any;
  retries: number;
  maxRetries: number;
}

class Heapchat {
  private iframe: HTMLIFrameElement | null = null;
  private toggleButton: HTMLButtonElement | null = null;
  private static instance: Heapchat | null = null;
  private isInitialized: boolean = false;
  private messageQueue: QueuedMessage[] = [];
  private isProcessingQueue: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly API_URL = 'https://webui.heap.chat/';
  private position: Position = Position.BOTTOM_RIGHT;
  private apiKey: string = "";
  private supportImage?: string;

  constructor() {
    if (Heapchat.instance) return Heapchat.instance;
    Heapchat.instance = this;
    this.init();
    return this;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private init(): void {
    if (!this.isBrowser()) return;
    if (this.iframe) return;

    // Create toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
      </svg>
    `;
    this.toggleButton.style.cssText = `
      position: fixed;
      ${this.position === Position.BOTTOM_RIGHT ? 'right: 20px;' : 'left: 20px;'}
      bottom: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #007AFF;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      transition: all 0.3s ease;
    `;

    this.toggleButton.addEventListener('click', () => {
      if (this.iframe?.style.display === 'none') {
        this.show();
      } else {
        this.hide();
      }
    });

    document.body.appendChild(this.toggleButton);

    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.API_URL;

    // Set iframe styles
    this.iframe.style.cssText = `
      position: fixed;
      ${this.position === Position.BOTTOM_RIGHT ? 'right: 20px;' : 'left: 20px;'}
      bottom: 80px;
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.3s ease-in-out;
      display: none;
    `;
    document.body.appendChild(this.iframe);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue[0];

      try {
        if (!this.iframe?.contentWindow || !this.isInitialized) {
          throw new Error('iframe not ready');
        }

        setTimeout(() => {
          this.iframe?.contentWindow?.postMessage({
            type: message.type,
            ...message.payload
          }, this.API_URL);
        }, 200);

        // Remove the successfully sent message from queue
        this.messageQueue.shift();
      } catch (error) {
        console.error('Error sending message:', error);

        if (message.retries < message.maxRetries) {
          // Increment retry count and move to end of queue
          message.retries++;
          this.messageQueue.push(this.messageQueue.shift()!);

          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        } else {
          // Remove failed message after max retries
          console.error('Message failed after max retries:', message);
          this.messageQueue.shift();
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private enqueueMessage(message: QueuedMessage): void {
    this.messageQueue.push(message);
    this.processQueue();
  }

  public configure(config: HeapchatConfig) {
    this.apiKey = config.apiKey;
    this.position = config.position || Position.BOTTOM_RIGHT;
    this.supportImage = config.supportImage;

    if (!this.isBrowser()) {
      console.warn('Heapchat: configure called in non-browser environment. Skipping initialization.');
      return;
    }

    this.iframe?.addEventListener('load', () => {
      console.log('IFRAME LOADED');
      this.isInitialized = true;
      this.enqueueMessage({
        type: 'INIT',
        payload: {
          apiKey: this.apiKey,
          supportImage: this.supportImage,
          position: this.position
        },
        retries: 0,
        maxRetries: this.MAX_RETRIES
      });
    });
  }

  public login(userId: string) {
    this.enqueueMessage({
      type: 'LOGIN',
      payload: { userId },
      retries: 0,
      maxRetries: this.MAX_RETRIES
    });
  }

  public logout() {
    this.enqueueMessage({
      type: 'LOGOUT',
      payload: {},
      retries: 0,
      maxRetries: this.MAX_RETRIES
    });
  }

  public setCustomerData(data: CustomerDataModel) {
    this.enqueueMessage({
      type: 'CUSTOMER_DATA',
      payload: { data },
      retries: 0,
      maxRetries: this.MAX_RETRIES
    });
  }

  public show(): void {
    if (!this.isBrowser()) return;
    if (this.iframe && this.toggleButton) {
      this.iframe.style.display = 'block';
      this.toggleButton.style.transform = 'rotate(180deg)';
      requestAnimationFrame(() => {
        if (this.iframe) {
          this.iframe.style.opacity = '1';
          this.iframe.style.transform = 'translateY(0)';
        }
      });
    }
  }

  public hide(): void {
    if (!this.isBrowser()) return;
    if (this.iframe && this.toggleButton) {
      this.iframe.style.opacity = '0';
      this.iframe.style.transform = 'translateY(100%)';
      this.toggleButton.style.transform = 'rotate(0deg)';
      setTimeout(() => {
        if (this.iframe) {
          this.iframe.style.display = 'none';
        }
      }, 300);
    }
  }

  public destroy(): void {
    if (!this.isBrowser()) return;
    if (this.iframe) {
      document.body.removeChild(this.iframe);
      this.iframe = null;
    }
    if (this.toggleButton) {
      document.body.removeChild(this.toggleButton);
      this.toggleButton = null;
    }
    Heapchat.instance = null;
  }
}

const singleton = new Heapchat();

export {
  singleton as Heapchat,
  Heapchat as HeapchatClass
};