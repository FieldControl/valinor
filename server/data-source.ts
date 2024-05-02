import { DataSource } from "typeorm";

const myDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "developer",
  password: "5139dev6478",
  database: "valinor",
  entities: [__dirname + '/../entities/*.ts'],
    migrations: [__dirname + '/../migrations/*.ts'],
  logging: true,
  synchronize: true,
});


export default myDataSource;