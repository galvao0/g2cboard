import { Injectable } from '@nestjs/common';
import { FaturasEntity } from '../faturas/faturas.entity.js';
import { Repository } from 'typeorm';
import { DevedorEntity } from './devedor.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { FaturasService } from '../faturas/faturas.service.js';

@Injectable()
export class DevedoresService {
  constructor(
      @InjectRepository(DevedorEntity)
      private readonly devedorRepository: Repository<DevedorEntity>,

      @InjectRepository(FaturasEntity)
      private readonly faturasRepository: Repository<FaturasEntity>,

      private readonly faturasService: FaturasService,
  ) {}

  private async sincronizarDevedores() {
    const faturas = await this.faturasRepository.find();
    const devedores = new Map<string, FaturasEntity[]>();

    for (const fatura of faturas) {
      const cpf = fatura.cpf;

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
          cpf: cpf,
          nome: faturasDevedor[0].nome,
          totalDevedor: totalDevedor,
          faturas: faturasDevedor
        });

        

        await this.devedorRepository.save(dev);
      } else {
        devedorExiste.totalDevedor = totalDevedor;
        await this.devedorRepository.save(devedorExiste);
      }
    }
  }            
  
  async getDevedores() {
    await this.faturasService.asyncDbFaturas();
    this.sincronizarDevedores();

    return this.devedorRepository.find({
      relations: {
        faturas: true,
      },
    });
  }
}