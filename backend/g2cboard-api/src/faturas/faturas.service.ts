import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaturasEntity } from './faturas.entity.js';
import { DevedorEntity } from '../devedor/devedor.entity.js';
import { StatusFatura } from './status-fatura.js';

type FaturaApiResp = {
  codigo: string;
  valorCobranca: number;
  dataVencimento: string;
  linkFatura: string;
  linhaDigitavel: string;
  pixList: { brcode: string };
  beneficiario: { nome: string; cpf: string };
};

@Injectable()
export class FaturasService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FaturasEntity)
    private readonly faturasRepository: Repository<FaturasEntity>,
    @InjectRepository(DevedorEntity)
    private readonly devedoresRepository: Repository<DevedorEntity>,
  ) {}

  private limite = new Bottleneck({
    reservoir: 50,
    reservoirRefreshAmount: 50,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 5,
    minTime: 1200,
  });

  private headers() {
    return {
      accept: 'application/json',
      token: this.configService.get<string>('API_TOKEN'),
      senhaApi: this.configService.get<string>('API_PASS'),
    };
  }

  private async buscarFatura(num: string) {
    while (true) {
      try {
        const { data } = await axios.get<FaturaApiResp>(
          `${this.configService.get<string>('API_URL_BASE')}/${num}?pix=1`,
          { headers: this.headers() },
        );

        const devedor = await this.devedoresRepository.findOneBy({
          cpf: data.beneficiario.cpf,
        });

        return {
          codigo: data.codigo,
          valor: data.valorCobranca,
          vencimento: data.dataVencimento,
          linkFatura: data.linkFatura,
          codigoBarras: data.linhaDigitavel,
          codigoPix: data.pixList.brcode,
          devedor: devedor ? { id: devedor.id } : null,
          nome: data.beneficiario.nome,
          cpf: data.beneficiario.cpf,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 429) {
            await new Promise((r) => setTimeout(r, 600000));
            continue;
          }
          if (error.response?.status === 400) return null; // fatura inválida: pula
        }
        throw error;
      }
    }
  }

  async getFaturasApi() {
    const resp = await axios.get(
      `${this.configService.get<string>('API_URL_BASE')}/procurarPorVencida`,
      { headers: this.headers() },
    );
    const numFaturas: string[] = resp.data;

    const respFaturas = await Promise.all(
      numFaturas.map((num) =>
        this.limite.schedule(() => this.buscarFatura(num)),
      ),
    );

    return respFaturas.filter((f): f is NonNullable<typeof f> => f !== null);
  }

  async asyncDbFaturas() {
    const faturasApi = await this.getFaturasApi();
    const faturasDb = await this.faturasRepository.find();
    const hoje = new Date().toISOString().slice(0, 10);

    for (const faturaDb of faturasDb) {
      const existeNaApi = faturasApi.some((f) => f.codigo === faturaDb.codigo);

      if (!existeNaApi && faturaDb.status !== StatusFatura.PAGA) {
        faturaDb.status = StatusFatura.PAGA;
        faturaDb.dataPagamento = hoje;
        await this.faturasRepository.save(faturaDb);
      }
    }

    for (const faturaApi of faturasApi) {
      const existeNoDb = faturasDb.some((f) => f.codigo === faturaApi.codigo);

      if (!existeNoDb) {
        const nova = this.faturasRepository.create(faturaApi);
        await this.faturasRepository.save(nova);
      }
    }
  }

  async getFaturasDb() {
    return await this.faturasRepository.find();
  }

  async deleteAll() {
    await this.faturasRepository.deleteAll();
  }
}
