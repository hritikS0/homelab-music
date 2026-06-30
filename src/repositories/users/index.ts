import { PrismaClient, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class UserRepository {
  private db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  public async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  public async create(data: { email: string; passwordHash: string }): Promise<User> {
    return this.db.user.create({
      data,
    });
  }
}

export default UserRepository;
