import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  password?: string;

  @Column()
  permission: string;

  @Column('int', { default: 365 })
  lifeTime?: number;

  @CreateDateColumn()
  createdAt: Date;
}
