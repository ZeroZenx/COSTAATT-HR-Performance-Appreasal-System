import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-azure-ad';
import { ConfigService } from '@nestjs/config';
import { AuthService, AzureUserInfo } from '../auth.service';

@Injectable()
export class AzureAdStrategy extends PassportStrategy(Strategy, 'azure-ad') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${configService.get('AZURE_TENANT_ID')}/v2.0/.well-known/openid_configuration`,
      clientID: configService.get('AZURE_CLIENT_ID'),
      clientSecret: configService.get('AZURE_CLIENT_SECRET'),
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: configService.get('AZURE_REDIRECT_URI'),
      allowHttpForRedirectUrl: true,
      validateIssuer: true,
      passReqToCallback: false,
      scope: ['openid', 'profile', 'email'],
      loggingLevel: 'info',
      nonceLifetime: null,
      nonceMaxAmount: 5,
      useCookieInsteadOfSession: false,
      cookieEncryptionKeys: [
        { 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
        { 'key': '09876543210987654321098765432109', 'iv': '210987654321' }
      ],
      clockSkew: null,
    });
  }

  async validate(profile: any): Promise<any> {
    const azureUser: AzureUserInfo = {
      id: profile.oid,
      email: profile.upn || profile.email,
      name: profile.displayName,
      givenName: profile.given_name,
      surname: profile.family_name,
    };

    return this.authService.validateAzureUser(azureUser);
  }
}
