import { Card } from '../../kanban/cards/cards.entity';
import { ColumnTable } from '../../kanban/columns/columns.entity';
import { User } from '../../user/user.entity';

export default class TesteUtil {
  static giveAMeAValidUser(): User {
    const user = new User();
    user.id = '1';
    user.email = 'johndoe@email.com';
    user.name = 'John Doe';
    user.password = '123456';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
  }

  static giveAMeAValidColumn(): ColumnTable {
    const column = new ColumnTable();
    column.id = '1';
    column.title = '1';
    column.createdAt = new Date();
    column.updatedAt = new Date();

    return column;
  }

  static giveAMeAValidCard(): Card {
    const card = new Card();
    card.id = '1';
    card.title = 'New Card';
    card.description = 'Card description';
    card.columnsTable = this.giveAMeAValidColumn();
    card.user = this.giveAMeAValidUser();
    card.createdAt = new Date();
    card.updatedAt = new Date();

    return card;
  }
}
