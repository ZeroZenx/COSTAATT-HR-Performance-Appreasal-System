import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Microsoft OAuth Configuration
const oidcStrategy = new OIDCStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0/.well-known/openid_configuration`,
  clientID: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  responseType: 'code',
  responseMode: 'form_post',
  redirectUrl: process.env.REDIRECT_URI!,
  allowHttpForRedirectUrl: true,
  validateIssuer: false,
  passReqToCallback: true,
  scope: ['profile', 'email', 'openid'],
  loggingLevel: 'info',
  nonceLifetime: null,
  nonceMaxAmount: 5,
  useCookieInsteadOfSession: false,
  cookieEncryptionKeys: [
    { 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
    { 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
  ],
  clockSkew: null,
}, async (req: any, iss: string, sub: string, profile: any, accessToken: string, refreshToken: string, done: any) => {
  try {
    console.log('Microsoft OAuth Profile:', profile);
    
    // Extract user information from Microsoft profile
    const email = profile._json.email || profile._json.preferred_username;
    const firstName = profile._json.given_name || 'Unknown';
    const lastName = profile._json.family_name || 'User';
    const azureId = profile._json.oid || profile._json.sub;

    if (!email) {
      return done(new Error('No email found in Microsoft profile'), null);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      // Create new user for SSO
      user = await prisma.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'EMPLOYEE', // Default role
          authProvider: 'SSO',
          azureId: azureId,
          active: true
        }
      });

      // Create employee record
      await prisma.employee.create({
        data: {
          userId: user.id,
          dept: 'General',
          division: 'General',
          employmentType: 'FULL_TIME',
          categoryId: null
        }
      });

      console.log('Created new SSO user:', user.email);
    } else {
      // Update existing user with Azure ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          azureId: azureId,
          authProvider: 'SSO'
        }
      });

      console.log('Updated existing user with SSO:', user.email);
    }

    return done(null, user);
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    return done(error, null);
  }
});

// Configure passport
passport.use('azuread-openidconnect', oidcStrategy);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dept: true,
        title: true,
        authProvider: true,
        azureId: true,
        active: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
