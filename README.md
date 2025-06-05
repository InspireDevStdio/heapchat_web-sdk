# Heapchat Web SDK

The Heapchat Web SDK allows you to easily integrate the Heapchat customer messaging widget into your web application. This SDK provides a simple interface to initialize the chat widget, manage user sessions, and customize the appearance.

## Installation

```bash
npm install heapchat
# or
yarn add heapchat
# or
pnpm add heapchat
# or
bun add heapchat
```

## Quick Start

```typescript
import Heapchat from 'heapchat';

// Initialize the chat widget
const chat = new Heapchat({
  apiKey: 'your_api_key_here',
  position: 'bottom-right', // optional
  supportImage: 'https://your-support-image.com/image.jpg' // optional
});
```

## Configuration

The SDK accepts the following configuration options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Your Heapchat API key |
| `position` | 'bottom-right' \| 'bottom-left' | No | 'bottom-right' | Position of the chat widget |
| `supportImage` | string | No | - | Custom support team avatar image URL |

## API Reference

### Initialization

```typescript
const chat = new Heapchat({
  apiKey: 'your_api_key_here'
});
```

### User Authentication

#### Login
```typescript
chat.login('user_id');
```

#### Logout
```typescript
chat.logout();
```

### Customer Data

Set customer information for better support context:

```typescript
chat.setCustomerData({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});
```

### Widget Controls

#### Show Widget
```typescript
chat.show();
```

#### Hide Widget
```typescript
chat.hide();
```

#### Destroy Widget
```typescript
chat.destroy();
```

## Widget Behavior

- The widget initializes with a floating action button (FAB) in the configured position
- Clicking the FAB toggles the chat widget visibility
- The widget appears with a smooth animation
- The widget is responsive and works well on both desktop and mobile devices

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions. Key interfaces include:

```typescript
interface HeapchatConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  supportImage?: string;
}

interface CustomerDataModel {
  name?: string;
  email?: string;
  phone?: string;
}
```

## Best Practices

1. Initialize the SDK as early as possible in your application lifecycle
2. Set customer data when available to provide context for support agents
3. Handle user authentication state changes by calling appropriate login/logout methods
4. Clean up resources by calling `destroy()` when the chat widget is no longer needed

## Support

For issues and feature requests, please visit our [GitHub repository](https://github.com/InspireDevStdio/heapchat_web-sdk) or contact support at support@heap.chat.

