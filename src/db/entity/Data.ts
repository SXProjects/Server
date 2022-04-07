import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class Data extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data_type: string;

  @Column()
  time: Date;

  @Column()
  data: string;

  @Column()
  room: string;
}
