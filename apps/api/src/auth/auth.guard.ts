import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.slice(7);

    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      const user = await this.prisma.user.findFirst({
        where: { role: 'STAFF' },
        include: { familyOffice: true },
      });

      if (user) {
        request.user = {
          id: user.id,
          email: user.email,
          familyOfficeId: user.familyOfficeId,
          role: user.role,
          name: user.name,
          familyOfficeName: user.familyOffice.name,
        };
        return true;
      }

      throw new UnauthorizedException('No staff user found — run seed first');
    }

    // TODO: Verify JWT token and extract user claims
    throw new UnauthorizedException('Invalid token');
  }
}
