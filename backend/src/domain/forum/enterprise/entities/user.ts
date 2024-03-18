import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

export interface UserProps {
  email: string;
  password: string;
  name: string;
}

export class UserEntity extends Entity<UserProps> {
  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get name() {
    return this.props.name;
  }

  static create(props: UserProps, id?: UniqueEntityID) {
    const user = new UserEntity(props, id);

    return user;
  }
}
