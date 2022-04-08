import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Command extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  room: string;

  @Column()
  receiver: string;

  @Column()
  parameter: boolean;
}
