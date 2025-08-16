import { hash } from 'bcrypt';
import { User } from 'src/user/entity/user.entity';
import { Role } from 'src/commons/enums/roles.enum';
import { AppDataSource } from 'src/db/data-source';

async function createAdmin() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const phoneNumber = '09205995765';
  const password = 'mehdi1365';
  const hashedPassword = await hash(password, 10);

  const existing = await userRepository.findOneBy({ phoneNumber });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const user = userRepository.create({
    phoneNumber,
    passwordHash: hashedPassword,
    role: Role.Admin,
  });

  await userRepository.save(user);
  console.log('Admin created successfully.');
  await AppDataSource.destroy();
}

void createAdmin().then(() => process.exit());
