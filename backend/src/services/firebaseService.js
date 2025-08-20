import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Servicio Firebase Admin SDK
 * Maneja autenticación, Firestore, Cloud Messaging, etc.
 */
class FirebaseService {
  constructor() {
    this.admin = null;
    this.messaging = null;
    this.firestore = null;
    this.auth = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa Firebase Admin SDK
   */
  initialize() {
    if (this.isInitialized) {
      return this.admin;
    }

    try {
      // Leer el archivo de credenciales
      const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

      // Inicializar Firebase Admin
      this.admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
      });

      // Inicializar servicios
      this.messaging = admin.messaging();
      this.firestore = admin.firestore();
      this.auth = admin.auth();

      this.isInitialized = true;
      console.log('Firebase Admin SDK inicializado correctamente');
      
      return this.admin;
    } catch (error) {
      console.error('Error inicializando Firebase Admin SDK:', error);
      throw error;
    }
  }

  /**
   * Obtiene la instancia de Firebase Admin
   */
  getAdmin() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.admin;
  }

  /**
   * Obtiene el servicio de Cloud Messaging
   */
  getMessaging() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.messaging;
  }

  /**
   * Obtiene el servicio de Firestore
   */
  getFirestore() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.firestore;
  }

  /**
   * Obtiene el servicio de Authentication
   */
  getAuth() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.auth;
  }

  // ==================== CLOUD MESSAGING ====================

  /**
   * Envía una notificación a un dispositivo específico
   */
  async sendNotificationToDevice(deviceToken, notification, data = {}) {
    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              contentAvailable: true
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('Notificación enviada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    }
  }

  /**
   * Envía notificaciones a múltiples dispositivos
   */
  async sendNotificationToDevices(deviceTokens, notification, data = {}) {
    try {
      const message = {
        tokens: deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              contentAvailable: true
            }
          }
        }
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log('Notificaciones enviadas:', response.successCount, 'exitosas,', response.failureCount, 'fallidas');
      
      // Manejar tokens inválidos
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(deviceTokens[idx]);
            console.error('Token fallido:', deviceTokens[idx], resp.error);
          }
        });
        return { success: response.successCount, failed: failedTokens };
      }

      return { success: response.successCount, failed: [] };
    } catch (error) {
      console.error('Error enviando notificaciones múltiples:', error);
      throw error;
    }
  }

  /**
   * Envía notificación a un tema específico
   */
  async sendNotificationToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              contentAvailable: true
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('Notificación a tema enviada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('Error enviando notificación a tema:', error);
      throw error;
    }
  }

  /**
   * Suscribe dispositivos a un tema
   */
  async subscribeToTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.subscribeToTopic(deviceTokens, topic);
      console.log('Dispositivos suscritos al tema:', topic, response);
      return response;
    } catch (error) {
      console.error('Error suscribiendo a tema:', error);
      throw error;
    }
  }

  /**
   * Desuscribe dispositivos de un tema
   */
  async unsubscribeFromTopic(deviceTokens, topic) {
    try {
      const response = await this.messaging.unsubscribeFromTopic(deviceTokens, topic);
      console.log('Dispositivos desuscritos del tema:', topic, response);
      return response;
    } catch (error) {
      console.error('Error desuscribiendo de tema:', error);
      throw error;
    }
  }

  // ==================== FIRESTORE ====================

  /**
   * Guarda un documento en Firestore
   */
  async saveDocument(collection, docId, data) {
    try {
      const docRef = this.firestore.collection(collection).doc(docId);
      await docRef.set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Documento guardado en Firestore:', collection, docId);
      return docRef;
    } catch (error) {
      console.error('Error guardando documento en Firestore:', error);
      throw error;
    }
  }

  /**
   * Obtiene un documento de Firestore
   */
  async getDocument(collection, docId) {
    try {
      const doc = await this.firestore.collection(collection).doc(docId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo documento de Firestore:', error);
      throw error;
    }
  }

  /**
   * Actualiza un documento en Firestore
   */
  async updateDocument(collection, docId, data) {
    try {
      const docRef = this.firestore.collection(collection).doc(docId);
      await docRef.update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Documento actualizado en Firestore:', collection, docId);
      return docRef;
    } catch (error) {
      console.error('Error actualizando documento en Firestore:', error);
      throw error;
    }
  }

  /**
   * Elimina un documento de Firestore
   */
  async deleteDocument(collection, docId) {
    try {
      await this.firestore.collection(collection).doc(docId).delete();
      console.log('Documento eliminado de Firestore:', collection, docId);
      return true;
    } catch (error) {
      console.error('Error eliminando documento de Firestore:', error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Verifica un token de Firebase Auth
   */
  async verifyAuthToken(token) {
    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      console.log('Token verificado para usuario:', decodedToken.uid);
      return decodedToken;
    } catch (error) {
      console.error('Error verificando token de auth:', error);
      throw error;
    }
  }

  /**
   * Crea un usuario personalizado
   */
  async createCustomUser(userData) {
    try {
      const userRecord = await this.auth.createUser(userData);
      console.log('Usuario creado en Firebase Auth:', userRecord.uid);
      return userRecord;
    } catch (error) {
      console.error('Error creando usuario en Firebase Auth:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de un usuario
   */
  async getUser(uid) {
    try {
      const userRecord = await this.auth.getUser(uid);
      return userRecord;
    } catch (error) {
      console.error('Error obteniendo usuario de Firebase Auth:', error);
      throw error;
    }
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(uid, userData) {
    try {
      const userRecord = await this.auth.updateUser(uid, userData);
      console.log('Usuario actualizado en Firebase Auth:', uid);
      return userRecord;
    } catch (error) {
      console.error('Error actualizando usuario en Firebase Auth:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(uid) {
    try {
      await this.auth.deleteUser(uid);
      console.log('Usuario eliminado de Firebase Auth:', uid);
      return true;
    } catch (error) {
      console.error('Error eliminando usuario de Firebase Auth:', error);
      throw error;
    }
  }

  // ==================== FUNCIONES ESPECÍFICAS PARA VOLUNTARIOS ====================

  /**
   * Guarda información de notificación de usuario
   */
  async saveUserNotificationInfo(userId, deviceToken, preferences = {}) {
    try {
      await this.saveDocument('user_notifications', userId, {
        deviceToken,
        preferences,
        platform: 'mobile',
        active: true
      });
      console.log('Información de notificación guardada para usuario:', userId);
    } catch (error) {
      console.error('Error guardando información de notificación:', error);
      throw error;
    }
  }

  /**
   * Obtiene tokens de dispositivos para un tipo de usuario
   */
  async getDeviceTokensByUserType(userType) {
    try {
      const snapshot = await this.firestore
        .collection('user_notifications')
        .where('userType', '==', userType)
        .where('active', '==', true)
        .get();

      const tokens = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.deviceToken) {
          tokens.push(data.deviceToken);
        }
      });

      return tokens;
    } catch (error) {
      console.error('Error obteniendo tokens por tipo de usuario:', error);
      throw error;
    }
  }

  /**
   * Guarda log de notificación enviada
   */
  async logNotification(notificationData) {
    try {
      await this.saveDocument('notification_logs', null, {
        ...notificationData,
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error guardando log de notificación:', error);
    }
  }
}

// Exportar instancia singleton
export const firebaseService = new FirebaseService();
export default firebaseService;