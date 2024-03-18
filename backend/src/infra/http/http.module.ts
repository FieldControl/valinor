import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { CryptographyModule } from 'src/infra/cryptography/cryptography.module';
import { AuthenticateController } from './routes/users/authenticate-user.controller';
import { AuthenticateService } from './routes/users/authenticate-user.service';
import { UserController } from './routes/users/users.controller';
import { UsersService } from './routes/users/users.service';
import { TaskController } from './routes/task/task.controller';
import { TaskService } from './routes/task/task.service';
import { ProjectController } from './routes/project/projects.controller';
import { ProjectService } from './routes/project/projects.service';
import { ColumnController } from './routes/column/column.controller';
import { ColumnService } from './routes/column/column.service';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  providers: [
    UsersService,
    AuthenticateService,
    TaskService,
    ProjectService,
    ColumnService,
  ],
  controllers: [
    UserController,
    AuthenticateController,
    TaskController,
    ProjectController,
    ColumnController,
  ],
})
export class HttpModule {}
