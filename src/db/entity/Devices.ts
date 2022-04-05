import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Devices extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  version: number;

  @Column({ unique: true })
  physicalId: number;

  @Column({ type: 'int', array: true })
  virtualIds: number[];
}
