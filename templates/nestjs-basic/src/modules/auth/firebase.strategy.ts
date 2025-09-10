<% if (includeFirebaseAuth) { -%>
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  private defaultApp: admin.app.App;

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FCM_PROJECT_ID,
                privateKey: process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FCM_CLIENT_EMAIL,
            }),
        });
    }
    this.defaultApp = admin.app();
  }

  async validate(token: string) {
    try {
      const firebaseUser: any = await this.defaultApp.auth().verifyIdToken(token, true);
      return firebaseUser;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
<% } -%>
