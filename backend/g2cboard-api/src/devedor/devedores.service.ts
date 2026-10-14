import { Injectable } from '@nestjs/common';

@Injectable()
export class DevedorService {
  constructor(
      @InjectRepository(DevedorEntity)
      private readonly devedorRepository: Repository<DevedorEntity>,

      @InjectRepository(FaturasEntity)
      private readonly faturasRepository: Repository<FaturasEntity>,
  ) {}

  async sincronizarDevedores() {
    const faturas = await this.faturasRepository.find();
    const devedores = new Map<string, FaturasEntity[]>();

    for (const fatura of faturas) {
      const cpf = fatura.cpfDevedor;

      if (!cpf) continue;

      const devedor = devedores.get(cpf) ?? [];
      devedor.push(fatura);
      devedores.set(cpf, devedor);
    }

    for (const [cpf, faturasDevedor] of devedores) {
      const totalDevedor = faturasDevedor.reduce(
        (soma, fatura) => soma + Number(fatura.valor), 0);
      const devedorExiste = await this.devedorRepository.findOneBy({ cpf });

      if (!devedorExiste) {
        const dev = this.devedorRepository.create({
          cpf,
          nome: faturasDevedor[0].nomeDevedor,
          codigo: codigo,
          saldoDevedor: totalDevedor,
      });

      await this.devedorRepository.save(dev);
      } else {
        devedorExiste.saldoDevedor = totalDevedor;
        await this.devedorRepository.save(devedorExiste);
      }
    }
  }                                                                                                                                                         
}