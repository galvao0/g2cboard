import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import { DevedorResponse } from './dto/devedor-response.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevedorEntity } from './devedor.entity.js';

@Injectable()
export class DevedoresService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(DevedorEntity)
    private readonly devedorRepository: Repository<DevedorEntity>,
  ) {}

  private limite = new Bottleneck({
    reservoir: 80,
    reservoirRefreshAmount: 80,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 5,
    minTime: 750,
  });

  async getDevedoresApi() {
    const resp = await axios.get(
      `${this.configService.get<string>('API_URL_BASE')}/procurarPorVencida`,
      {
        headers: {
          accept: 'application/json',
          token: this.configService.get<string>('API_TOKEN'),
          senhaApi: this.configService.get<string>('API_PASS'),
        },
      },
    );
    const numFaturas = resp.data;

    console.log(numFaturas)
    let i = 0;

    const respDevedores = await Promise.all(
      numFaturas.map(async (num: string) =>
        this.limite.schedule(async () => {
          const fatura = await axios.get<{
            valorCobranca: number;
            beneficiario: { nome: string };
          }>(`${this.configService.get<string>('API_URL_BASE')}/${num}`, {
            headers: {
              accept: 'application/json',
              token: this.configService.get<string>('API_TOKEN'),
              senhaApi: this.configService.get<string>('API_PASS'),
            },
          });
          i++;
          console.log({
            i: i,
            nome: fatura.data.beneficiario.nome,
            saldoDevedor: fatura.data.valorCobranca,
          });
          return {
            nome: fatura.data.beneficiario.nome,
            saldoDevedor: fatura.data.valorCobranca,
          };
        }),
      ),
    );

    const devedores = new Map<string, number>();

    for (const devedor of respDevedores) {
      const valorAtual = devedores.get(devedor.nome) ?? 0;

      devedores.set(devedor.nome, valorAtual + devedor.saldoDevedor);
    }

    return Array.from(devedores, ([nome, saldoDevedor]) => ({
      nome,
      saldoDevedor,
    }));
  }

  async sincronizarDevedores() {
    const devedores = await this.getDevedoresApi();
    for (const devedor of devedores) {
      const devedorExiste = await this.devedorRepository.findOneBy({
        nome: devedor.nome,
      });
      if (devedorExiste) {
        //devedorExiste.saldoDevedor = devedor.saldoDevedor;
        //await this.devedorRepository.save(devedorExiste);
        this.devedorRepository.createQueryBuilder('devedor').select(`UPDATE devedor set saldoDevedor=${devedor.saldoDevedor} where nome=${devedorExiste.nome}`)
      } else {
        const dev = this.devedorRepository.create({
          nome: devedor.nome,
          saldoDevedor: devedor.saldoDevedor,
        });
        
        await this.devedorRepository.save(dev);
      }
    }
  }

  async getDevedores() {
    return await this.devedorRepository.find();
  }
}
