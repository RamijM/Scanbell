import './src/polyfills';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

// Handle background events for notifications (Answer/Decline)
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    // You can implement logic here to accept/decline calls from the notification tray
    // but for now we'll just dismiss it if the user interacts.
    if (type === EventType.ACTION_PRESS && (pressAction.id === 'accept' || pressAction.id === 'decline')) {
        console.log('[Notifee] Background Action:', pressAction.id);
        await notifee.cancelNotification(notification.id);
    }
});

AppRegistry.registerComponent(appName, () => App);
