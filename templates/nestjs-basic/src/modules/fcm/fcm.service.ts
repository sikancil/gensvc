<% if (includeFcm) { -%>
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccount = {
      projectId: this.configService.get<string>('FCM_PROJECT_ID'),
      privateKey: this.configService.get<string>('FCM_PRIVATE_KEY').replace(/\\n/g, '\n'),
      clientEmail: this.configService.get<string>('FCM_CLIENT_EMAIL'),
    };

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.logger.log('Firebase Admin SDK Initialized');
    }
  }

  async sendNotification(token: string, payload: admin.messaging.MessagingPayload) {
    try {
      const response = await admin.messaging().send({ token, ...payload });
      this.logger.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw error;
    }
  }
}
<% } -%>
