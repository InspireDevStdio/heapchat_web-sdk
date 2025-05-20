interface HeapChatConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
}

class HeapChat {
  private iframe: HTMLIFrameElement | null = null;
  private static instance: HeapChat | null = null;

  constructor(private config: HeapChatConfig) {
    if (HeapChat.instance) {
      return HeapChat.instance;
    }

    this.config = {
      position: 'bottom-right',
      ...config
    };
    
    HeapChat.instance = this;
    this.init();
    return this;
  }

  private init(): void {
    if (this.iframe) return;

    this.iframe = document.createElement('iframe');
    
    // Add API key to URL
    const params = new URLSearchParams({
      apiKey: this.config.apiKey
    });

    this.iframe.src = `https://webui.heap.chat?${params.toString()}`;
    
    // Set iframe styles
    this.iframe.style.cssText = `
      position: fixed;
      ${this.config.position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      bottom: 20px;
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.3s ease-in-out;
    `;

    document.body.appendChild(this.iframe);

    // Fade in animation
    requestAnimationFrame(() => {
      if (this.iframe) {
        this.iframe.style.opacity = '1';
        this.iframe.style.transform = 'translateY(0)';
      }
    });
  }

  public show(): void {
    if (this.iframe) {
      this.iframe.style.display = 'block';
      requestAnimationFrame(() => {
        if (this.iframe) {
          this.iframe.style.opacity = '1';
          this.iframe.style.transform = 'translateY(0)';
        }
      });
    }
  }

  public hide(): void {
    if (this.iframe) {
      this.iframe.style.opacity = '0';
      this.iframe.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (this.iframe) {
          this.iframe.style.display = 'none';
        }
      }, 300);
    }
  }

  public destroy(): void {
    if (this.iframe) {
      document.body.removeChild(this.iframe);
      this.iframe = null;
      HeapChat.instance = null;
    }
  }
}

export default HeapChat;
