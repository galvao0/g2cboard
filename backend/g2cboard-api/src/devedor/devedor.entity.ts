
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FaturasEntity } from '../faturas/faturas.entity.js';

@Entity('devedor')
export class DevedorEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true })
    cpf: string;
    @Column()
    nome: string;
    @Column({ type: 'decimal' })
    totalDevedor: number
    @OneToMany(() => FaturasEntity, (fatura) => fatura.devedor)
    faturas: FaturasEntity[];
}
