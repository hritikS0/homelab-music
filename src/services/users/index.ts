import { User } from '@prisma/client';
import { UserRepository } from '@/repositories/users/index';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  public async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  public async createUser(email: string, passwordHash: string): Promise<User> {
    return this.userRepository.create({ email, passwordHash });
  }
}

export default UserService;
