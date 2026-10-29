import { Injectable } from '@nestjs/common';
import { FaturasEntity } from '../faturas/faturas.entity.js';
import { Repository } from 'typeorm';
import { DevedorEntity } from './devedor.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusFatura } from '../faturas/status-fatura.js';

@Injectable()
export class DevedoresService {
  constructor(
    @InjectRepository(DevedorEntity)
    private readonly devedorRepository: Repository<DevedorEntity>,

    @InjectRepository(FaturasEntity)
    private readonly faturasRepository: Repository<FaturasEntity>,
  ) {}

  async sincronizarDevedores() {
    const faturas = await this.faturasRepository.find();
    const porCpf = new Map<string, FaturasEntity[]>();

    for (const fatura of faturas) {
      if (!fatura.cpf) continue;
      const lista = porCpf.get(fatura.cpf) ?? [];
      lista.push(fatura);
      porCpf.set(fatura.cpf, lista);
    }

    for (const [cpf, faturasDevedor] of porCpf) {
      const totalDevedor = faturasDevedor
        .filter((f) => f.status !== StatusFatura.PAGA)
        .reduce((soma, f) => soma + Number(f.valor), 0);

      const existente = await this.devedorRepository.findOneBy({ cpf });

      if (!existente) {
        const dev = this.devedorRepository.create({
          cpf,
          nome: faturasDevedor[0].nome,
          totalDevedor,
          faturas: faturasDevedor,
        });
        await this.devedorRepository.save(dev);
      } else {
        existente.totalDevedor = totalDevedor;
        await this.devedorRepository.save(existente);
      }
    }
  }

  async getDevedores() {
    return this.devedorRepository.find({ relations: { faturas: true } });
  }

  async getDevedoresDb() {
    return this.getDevedores();
  }
}
