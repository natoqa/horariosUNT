import { User } from '../entities/user.entity';
import { LoginDTO } from '../../application/dtos/login.dto';
import { RecoverPasswordDTO } from '../../application/dtos/recover-password.dto';
import { ChangePasswordDTO } from '../../application/dtos/change-password.dto';

export interface IAuthRepository {
  login(dto: LoginDTO): Promise<User>;
  logout(): Promise<void>;
  getSessionUser(): Promise<User | null>;
  recoverPassword(dto: RecoverPasswordDTO): Promise<void>;
  changePassword(dto: ChangePasswordDTO): Promise<void>;
}
