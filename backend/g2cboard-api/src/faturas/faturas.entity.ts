import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DevedorEntity } from "../devedor/devedor.entity.js";

@Entity('faturas')
export class FaturasEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column()
    codigo: string
    @Column({ type: 'decimal' })
    valor: number
    @Column()
    vencimento: string
    @Column()
    linkFatura: string
    @Column()
    codigoBarras: string
    @Column({ nullable: true })
    codigoPix: string

    @ManyToOne(() => DevedorEntity, (devedor) => devedor.faturas)
    devedor: DevedorEntity[]
}