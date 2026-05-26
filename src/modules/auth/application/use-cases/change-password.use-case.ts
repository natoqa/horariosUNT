import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { ChangePasswordDTO, changePasswordSchema } from '../dtos/change-password.dto';

export class ChangePasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(dto: ChangePasswordDTO): Promise<void> {
    const validated = changePasswordSchema.parse(dto);
    return this.authRepository.changePassword(validated);
  }
}
