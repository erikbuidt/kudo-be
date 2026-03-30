import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/package/prisma/prisma.service';
import { User } from '@/common/decorators/user.decorator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        giving_budget: true,
        received_balance: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, email: true, display_name: true },
    });
  }

  findMe(user: { id: string }) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        display_name: true,
        giving_budget: true,
        received_balance: true,
      },
    });
  }
}
