import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  campus?: string;
}

export interface AzureUserInfo {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  surname?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.isActive) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      campus: user.campus,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        campus: user.campus,
      },
    };
  }

  async validateAzureUser(azureUser: AzureUserInfo): Promise<User> {
    let user = await this.usersService.findByEmail(azureUser.email);
    
    if (!user) {
      // Create new user if they don't exist
      user = await this.usersService.create({
        email: azureUser.email,
        name: azureUser.name,
        role: UserRole.STAFF, // Default role, admin can change later
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }

  async refreshToken(user: User) {
    return this.login(user);
  }
}
