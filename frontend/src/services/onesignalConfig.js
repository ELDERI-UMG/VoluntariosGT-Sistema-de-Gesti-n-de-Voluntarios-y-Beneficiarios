import { OneSignal } from 'react-native-onesignal';

// OneSignal App ID configurado para VoluntariosGT
const ONESIGNAL_APP_ID = '4e454899-0398-41a0-b99c-4fc7a00f896e';

class OneSignalService {
  static initialize() {
    // Remove this method to stop OneSignal Debugging
    OneSignal.Debug.setLogLevel(6);

    // OneSignal Initialization
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // requestPermission will show the native iOS or Android notification permission prompt.
    // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 8)
    OneSignal.Notifications.requestPermission(true);

    // Method for listening for notification clicks
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('OneSignal: notification clicked:', event);
    });
  }

  static setUser(userId) {
    OneSignal.User.pushSubscription.addObserver('pushSubscriptionChanged', (event) => {
      console.log('OneSignal: push subscription changed', event);
    });
    
    // Set external user ID
    OneSignal.User.addAlias('external_id', userId);
  }

  static addTags(tags) {
    OneSignal.User.addTags(tags);
  }

  static removeTags(tags) {
    OneSignal.User.removeTags(tags);
  }

  static sendNotification(notification) {
    // Esta función sería llamada desde el backend
    console.log('Sending notification:', notification);
  }
}

export default OneSignalService;