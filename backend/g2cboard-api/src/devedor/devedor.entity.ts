import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FaturasEntity } from "../faturas/faturas.entity.js";

@Entity('devedor') 
export class DevedorEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column()
    codigo: string
    @Column()
    nome: string
    @Column({ type: 'decimal' })
    saldoDevedor: number

    @OneToMany(() => FaturasEntity, (fatura) => fatura.devedor)
    faturas: FaturasEntity[]
}