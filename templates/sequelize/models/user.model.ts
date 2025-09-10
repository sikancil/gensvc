<% if (useSequelize) { -%>
import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ unique: true, allowNull: false })
  email: string;

  @Column
  name: string;

  <% if (includeLocalAuth) { -%>
  @Column({ allowNull: false })
  password: string;
  <% } -%>
}
<% } -%>
