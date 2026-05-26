import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { LoginDTO, loginSchema } from '../dtos/login.dto';
import { User } from '../../domain/entities/user.entity';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: LoginDTO): Promise<User> {
    const validated = loginSchema.parse(dto);
    return this.authRepository.login(validated);
  }
}
