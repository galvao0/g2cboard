import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('devedor') 
export class DevedorEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column()
    nome: string
    @Column({ type: 'decimal' })
    saldoDevedor: number
}