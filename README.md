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
import { Heapchat } from 'heapchat';

// Configure the widget
Heapchat.configure({
  apiKey: 'your_api_key_here'
});
```

## Configuration

The SDK uses a singleton pattern, meaning you'll always work with the same instance across your application. The configuration accepts the following options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Your Heapchat API key |
| `position` | `Position.BOTTOM_RIGHT` \| `Position.BOTTOM_LEFT` | No | `Position.BOTTOM_RIGHT` | Position of the chat widget. |
| `supportImage` | string | No | - | Custom support team avatar image URL |

## API Reference

### Customization

```typescript
import { Heapchat } from 'heapchat';

// Configure the widget
Heapchat.configure({
  apiKey: 'your_api_key_here',
  position: Position.BOTTOM_RIGHT, // optional
  supportImage: 'https://yourcdn.com/avatar.png' // optional
});
```

### User Authentication

#### Login
```typescript
Heapchat.login('user_id');
```

#### Logout
```typescript
Heapchat.logout();
```

### Customer Data

Set customer information for better support context:

```typescript
Heapchat.setCustomerData({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});
```

### Widget Controls

#### Show Widget
```typescript
Heapchat.show();
```

#### Hide Widget
```typescript
Heapchat.hide();
```

#### Destroy Widget
```typescript
Heapchat.destroy();
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

1. Configure the SDK as early as possible in your application lifecycle
2. Set customer data when available to provide context for support agents
3. Handle user authentication state changes by calling appropriate login/logout methods
4. Clean up resources by calling `destroy()` when the chat widget is no longer needed

## Support

For issues and feature requests, please visit our [GitHub repository](https://github.com/InspireDevStdio/heapchat_web-sdk) or contact support at support@heap.chat.

