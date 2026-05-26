import { IAuthRepository } from '../../domain/repositories/auth.repository';

export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
