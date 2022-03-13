import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Command extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  device_id: number;

  @Column()
  time: Date;

  @Column()
  command_name: string;

  @Column()
  first_command_data: string;

  @Column()
  second_command_data?: string;
}
