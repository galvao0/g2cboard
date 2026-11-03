import { Injectable } from '@nestjs/common';
import { FaturasEntity } from '../faturas/faturas.entity.js';
import { Repository } from 'typeorm';
import { DevedorEntity } from './devedor.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusFatura } from '../faturas/status-fatura.js';
import { StatusDevedor } from './enum/status-devedor.js';

@Injectable()
export class DevedoresService {

  constructor (
    @InjectRepository(DevedorEntity)
    private readonly devedorRepository: Repository<DevedorEntity>,
    @InjectRepository(FaturasEntity)
    private readonly faturasRepository: Repository<FaturasEntity>
  ) {}

  async sincronizarDevedores() {
    const faturas = await this.faturasRepository.find();
    const devs = new Map<string, FaturasEntity[]>();

    for (const fatura of faturas) {
      if (!fatura.cpf) continue;
      const lista = devs.get(fatura.cpf) ?? [];
      lista.push(fatura);
      devs.set(fatura.cpf, lista);
    }

    for (const [cpf, faturasDevedor] of devs) {
      const totalDevedor = faturasDevedor
        .filter((f) => f.status !== StatusFatura.PAGA)
        .reduce((t, f) => t + Number(f.valor), 0);

      const existe = await this.devedorRepository.findOneBy({ cpf });

      if (!existe) {
        const dev = this.devedorRepository.create({
          cpf,
          nome: faturasDevedor[0].nome,
          totalDevedor,
          faturas: faturasDevedor,
          status: totalDevedor === 0 ? StatusDevedor.EMDIA : StatusDevedor.EMATRASO
        });
        await this.devedorRepository.save(dev);
        console.log(dev)
      } else {
        existe.totalDevedor = totalDevedor;
        existe.status = totalDevedor === 0 ? StatusDevedor.EMDIA : StatusDevedor.EMATRASO
        await this.devedorRepository.save(existe);
        console.log(existe)
      }
    }
  }

  async getDevedores() {
    return this.devedorRepository.find({ relations: { faturas: true } });
  }
}
