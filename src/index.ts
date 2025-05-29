interface HeapchatConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  supportImage?: string;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
}

class Heapchat {
  private iframe: HTMLIFrameElement | null = null;
  private toggleButton: HTMLButtonElement | null = null;
  private static instance: Heapchat | null = null;
  private isReady: boolean = false;
  private messageQueue: Array<{ type: string; payload: any }> = [];

  constructor(private config: HeapchatConfig) {
    if (Heapchat.instance) {
      return Heapchat.instance;
    }

    this.config = {
      position: 'bottom-right',
      ...config
    };
    
    Heapchat.instance = this;
    this.init();
    return this;
  }

  private init(): void {
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
      ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
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
    this.iframe.src = `https://webui.heap.chat`;
    
    // Set iframe styles
    this.iframe.style.cssText = `
      position: fixed;
      ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
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

    // Listen for messages from iframe
    window.addEventListener('message', this.handleMessage);

    document.body.appendChild(this.iframe);
  }

  private handleMessage = (event: MessageEvent) => {
    // Verify origin
    if (event.origin !== 'https://webui.heap.chat') return;

    const { type } = event.data;

    if (type === 'READY') {
      this.isReady = true;
      this.sendMessage({
        type: 'INIT',
        apiKey: this.config.apiKey,
        supportImage: this.config.supportImage
      });

      // Process queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.sendMessage(message);
        }
      }
    }
  };

  private sendMessage(message: any) {
    if (!this.iframe || !this.isReady) {
      this.messageQueue.push(message);
      return;
    }

    this.iframe.contentWindow?.postMessage(message, 'https://webui.heap.chat');
  }

  public show(): void {
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
    if (this.iframe) {
      window.removeEventListener('message', this.handleMessage);
      document.body.removeChild(this.iframe);
      this.iframe = null;
    }
    if (this.toggleButton) {
      document.body.removeChild(this.toggleButton);
      this.toggleButton = null;
    }
    Heapchat.instance = null;
  }

  // Public API methods
  public setCustomerData(userData: UserData): void {
    this.sendMessage({
      type: 'SET_CUSTOMER_DATA',
      userData
    });
  }

  public login(userId: string): void {
    this.sendMessage({
      type: 'LOGIN',
      userId
    });
  }

  public logout(): void {
    this.sendMessage({
      type: 'LOGOUT'
    });
  }

  public setDeviceToken(deviceToken: string): void {
    this.sendMessage({
      type: 'SET_DEVICE_TOKEN',
      deviceToken
    });
  }
}

export default Heapchat;
