//utilizando o typeorm e SQLite
import { DataSourceOptions } from "typeorm";

export const config: DataSourceOptions = {
    type: "sqlite",
    database: ".db/sql.db",
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    synchronize: true
  }
  