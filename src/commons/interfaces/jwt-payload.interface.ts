import { Role } from '../enums/roles.enum';

export interface JwtPayload {
  userId: string;
  role: Role;
}
