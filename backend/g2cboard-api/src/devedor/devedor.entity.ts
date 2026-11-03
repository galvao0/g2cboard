
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FaturasEntity } from '../faturas/faturas.entity.js';
import { StatusDevedor } from './enum/status-devedor.js';

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
    @Column({ type: 'enum', enum: StatusDevedor, nullable: true })
    status: StatusDevedor
    @OneToMany(() => FaturasEntity, (fatura) => fatura.devedor)
    faturas: FaturasEntity[];
}
