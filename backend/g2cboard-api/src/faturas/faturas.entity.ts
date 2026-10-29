import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DevedorEntity } from '../devedor/devedor.entity.js';
import { StatusFatura } from './status-fatura.js';

@Entity('faturas')
export class FaturasEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  codigo: string;
  @Column({ type: 'decimal' })
  valor: number;
  @Column()
  vencimento: string;
  @Column()
  linkFatura: string;
  @Column()
  codigoBarras: string;
  @Column({ nullable: true })
  codigoPix: string;
  @Column()
  nome: string;
  @Column({ default: StatusFatura.VENCIDA })
  status: StatusFatura;
  @Column({ type: 'date', nullable: true })
  vencimentoDate: string | null;

  @Column({ type: 'date', nullable: true })
  dataPagamento: string | null;

  @ManyToOne(() => DevedorEntity, (devedor) => devedor.faturas, {
    nullable: true,
  })
  @JoinColumn({ name: 'devedor_id' })
  devedor: DevedorEntity | null;

  @Column()
  cpf: string;
}
