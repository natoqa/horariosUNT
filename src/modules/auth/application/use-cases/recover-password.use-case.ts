import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { RecoverPasswordDTO, recoverPasswordSchema } from '../dtos/recover-password.dto';

export class RecoverPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: RecoverPasswordDTO): Promise<void> {
    const validated = recoverPasswordSchema.parse(dto);
    return this.authRepository.recoverPassword(validated);
  }
}
