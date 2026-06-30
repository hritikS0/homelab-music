import { User } from '@/types/user';

export class UserRepository {
  public async findById(_id: string): Promise<User | null> {
    return null;
  }

  public async findByEmail(_email: string): Promise<User | null> {
    return null;
  }

  public async create(_data: { email: string; passwordHash: string }): Promise<User | null> {
    return null;
  }
}

export default UserRepository;
