export enum Position {
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left'
}

export type HeapchatConfig = {
  apiKey: string;
  position?: Position;
  supportImage?: string;
  showToggleButton?: boolean;
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

export type HeapchatTheme = {
  // Primary colors - dark mode
  primaryColor?: string;
  primaryTextColor?: string;
  secondaryColor?: string;
  secondaryTextColor?: string;
  backgroundColor?: string;
  backgroundTextColor?: string;
  borderColor?: string;
  borderTextColor?: string;
  iconColor?: string;
  iconTextColor?: string;
  headerColor?: string;
  headerIndicatorColor?: string;
  headerTextColor?: string;
  destructive?: string;
  destructiveText?: string;

  // Primary colors - light mode
  primaryColorLight?: string;
  primaryTextColorLight?: string;
  secondaryColorLight?: string;
  secondaryTextColorLight?: string;
  backgroundColorLight?: string;
  backgroundTextColorLight?: string;
  borderColorLight?: string;
  borderTextColorLight?: string;
  iconColorLight?: string;
  iconTextColorLight?: string;
  headerColorLight?: string;
  headerIndicatorColorLight?: string;
  headerTextColorLight?: string;
  destructiveLight?: string;
  destructiveTextLight?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

class Heapchat {
  private iframe: HTMLIFrameElement | null = null;
  private toggleButton: HTMLButtonElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
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
  private isMobile: boolean = false;
  private isOpen: boolean = false;
  private isToggleButtonVisible: boolean = true;
  private currentTheme: HeapchatTheme = {
    primaryColor: '#2563eb',
    primaryTextColor: '#ffffff',
    secondaryColor: '#27272a',
    secondaryTextColor: '#666666',

    primaryColorLight: '#2563eb',
    primaryTextColorLight: '#ffffff',
    secondaryColorLight: '#27272a',
    secondaryTextColorLight: '#666666',
  };
  private themeMode: ThemeMode = 'system';

  constructor() {
    if (Heapchat.instance) return Heapchat.instance;
    Heapchat.instance = this;
    this.init();
    return this;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private checkMobile(): boolean {
    return window.innerWidth <= 768;
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (!this.isBrowser()) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getCurrentThemeColors(): { primary: string; primaryText: string; secondary: string; secondaryText: string } {
    const isDark = this.themeMode === 'dark' || (this.themeMode === 'system' && this.getSystemTheme() === 'dark');
    
    return {
      primary: isDark ? this.currentTheme.primaryColor! : this.currentTheme.primaryColorLight!,
      primaryText: isDark ? this.currentTheme.primaryTextColor! : this.currentTheme.primaryTextColorLight!,
      secondary: isDark ? this.currentTheme.secondaryColor! : this.currentTheme.secondaryColorLight!,
      secondaryText: isDark ? this.currentTheme.secondaryTextColor! : this.currentTheme.secondaryTextColorLight!,
    };
  }

  private updateMobileState(): void {
    const wasMobile = this.isMobile;
    this.isMobile = this.checkMobile();
    
    if (wasMobile !== this.isMobile) {
      this.updateStyles();
    }
  }

  private updateStyles(): void {
    if (!this.iframe || !this.toggleButton || !this.closeButton) return;

    const { primary, primaryText, secondary, secondaryText } = this.getCurrentThemeColors();

    if (this.isMobile) {
      // Mobile styles
      this.iframe.style.cssText = `
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 85vh;
        border: none;
        outline: none;
        border-radius: 1.5rem 1.5rem 0 0;
        background: #09090b;
        box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
        z-index: 999999;
        opacity: 0;
        transform: translateY(100%);
        transition: all 0.3s ease-in-out;
        display: none;
        overflow: hidden;
        -webkit-border-radius: 1.5rem 1.5rem 0 0;
        -moz-border-radius: 1.5rem 1.5rem 0 0;
      `;

      this.toggleButton.style.cssText = `
        position: fixed;
        ${this.position === Position.BOTTOM_RIGHT ? 'right: 12px;' : 'left: 12px;'}
        bottom: 12px;
        width: 44px;
        height: 44px;
        border-radius: 1.5rem;
        background: ${primary};
        color: ${primaryText};
        border: none;
        cursor: pointer;
        display: ${this.isToggleButtonVisible ? 'flex' : 'none'};
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        transition: all 0.3s ease;
        touch-action: manipulation;
      `;

      this.closeButton.style.cssText = `
        position: fixed;
        right: 8px;
        top: calc(15vh - 36px);
        width: 28px;
        height: 28px;
        border-radius: 1.5rem;
        background: ${secondary};
        color: ${secondaryText};
        border: none;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000000;
        transition: all 0.3s ease;
        touch-action: manipulation;
        padding: 0;
      `;
    } else {
      // Desktop styles
      this.iframe.style.cssText = `
        position: fixed;
        ${this.position === Position.BOTTOM_RIGHT ? 'right: 20px;' : 'left: 20px;'}
        bottom: 80px;
        width: 400px;
        height: 600px;
        border: none;
        outline: none;
        border-radius: 1.5rem;
        background: #09090b;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        z-index: 999999;
        opacity: 0;
        transform: translateY(100%);
        transition: all 0.3s ease-in-out;
        display: none;
        overflow: hidden;
        -webkit-border-radius: 1.5rem;
        -moz-border-radius: 1.5rem;
      `;

      this.toggleButton.style.cssText = `
        position: fixed;
        ${this.position === Position.BOTTOM_RIGHT ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
        width: 48px;
        height: 48px;
        border-radius: 1.5rem;
        background: ${primary};
        color: ${primaryText};
        border: none;
        cursor: pointer;
        display: ${this.isToggleButtonVisible ? 'flex' : 'none'};
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        transition: all 0.3s ease;
      `;

      // Hide close button on desktop
      this.closeButton.style.display = 'none';
    }
  }

  private updateToggleIcon(): void {
    if (!this.toggleButton) return;

    if (this.isMobile) {
      // Mobile always shows chat icon
      this.toggleButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
        </svg>
      `;
    } else {
      // Desktop switches between chat and arrow icons
      if (this.isOpen) {
        this.toggleButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor"/>
          </svg>
        `;
      } else {
        this.toggleButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
          </svg>
        `;
      }
    }
  }

  private init(): void {
    if (!this.isBrowser()) return;
    if (this.iframe) return;

    this.isMobile = this.checkMobile();
    this.isOpen = false;

    // Create toggle button
    this.toggleButton = document.createElement('button');
    
    // Create close button (only for mobile)
    this.closeButton = document.createElement('button');
    this.closeButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
      </svg>
    `;

    // Set initial toggle icon
    this.updateToggleIcon();

    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.API_URL;

    // Update styles based on device type
    this.updateStyles();

    // Add resize listener for responsive updates
    window.addEventListener('resize', () => {
      this.updateMobileState();
    });

    // Add touch event listeners for mobile
    this.toggleButton.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent double-tap zoom
      this.toggleWidget();
    });

    this.closeButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.hide();
    });

    this.toggleButton.addEventListener('click', () => {
      this.toggleWidget();
    });

    this.closeButton.addEventListener('click', () => {
      this.hide();
    });

    document.body.appendChild(this.toggleButton);
    document.body.appendChild(this.closeButton);
    document.body.appendChild(this.iframe);
  }

  private toggleWidget(): void {
    if (this.iframe?.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
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
    this.isToggleButtonVisible = config.showToggleButton !== false; // Default to true if not specified

    if (!this.isBrowser()) {
      console.warn('Heapchat: configure called in non-browser environment. Skipping initialization.');
      return;
    }

    // Update toggle button visibility
    if (this.toggleButton) {
      this.toggleButton.style.display = this.isToggleButtonVisible ? 'flex' : 'none';
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

  public setTheme(theme: HeapchatTheme) {
    this.currentTheme = {
      ...this.currentTheme,
      ...theme
    };
    this.updateStyles();
    this.enqueueMessage({
      type: 'THEME',
      payload: { theme },
      retries: 0,
      maxRetries: this.MAX_RETRIES
    });
  }

  public setThemeMode(themeMode: ThemeMode) {
    this.themeMode = themeMode;
    this.updateStyles();
    this.enqueueMessage({
      type: 'THEME_MODE',
      payload: { themeMode },
      retries: 0,
      maxRetries: this.MAX_RETRIES
    });
  }

  public show(): void {
    if (!this.isBrowser()) return;
    if (this.iframe && this.toggleButton && this.closeButton) {
      this.isOpen = true;
      this.updateToggleIcon();
      this.iframe.style.display = 'block';
      if (this.isMobile) {
        this.closeButton.style.display = 'flex';
      }
      // Prevent body scroll on mobile when widget is open
      if (this.isMobile) {
        document.body.style.overflow = 'hidden';
      }
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
    if (this.iframe && this.toggleButton && this.closeButton) {
      this.isOpen = false;
      this.updateToggleIcon();
      this.iframe.style.opacity = '0';
      this.iframe.style.transform = 'translateY(100%)';
      this.closeButton.style.display = 'none';
      // Restore body scroll on mobile
      if (this.isMobile) {
        document.body.style.overflow = '';
      }
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
    if (this.closeButton) {
      document.body.removeChild(this.closeButton);
      this.closeButton = null;
    }
    Heapchat.instance = null;
  }

  public showToggleButton(): void {
    if (!this.isBrowser() || !this.toggleButton) return;
    this.isToggleButtonVisible = true;
    this.toggleButton.style.display = 'flex';
  }

  public hideToggleButton(): void {
    if (!this.isBrowser() || !this.toggleButton) return;
    this.isToggleButtonVisible = false;
    this.toggleButton.style.display = 'none';
  }
}

const singleton = new Heapchat();

export {
  singleton as Heapchat,
  Heapchat as HeapchatClass
};