import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaturasEntity } from "./faturas.entity.js";
import { DevedorEntity } from "../devedor/devedor.entity.js";

@Injectable()
export class FaturasService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FaturasEntity)
    private readonly faturasRepository: Repository<FaturasEntity>,
    @InjectRepository(DevedorEntity)
    private readonly devedoresRepository: Repository<DevedorEntity>
  ) {}

  private limite = new Bottleneck({
    reservoir: 50,
    reservoirRefreshAmount: 50,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 5,
    minTime: 1200,
  });

  private i = 0
  private async buscarFatura(num: string) {
    this.i++
    while (true) {
      try {
        const fatura = await axios.get<{
          codigo: string
          valorCobranca: number;
          dataVencimento: string
          linkFatura: string
          linhaDigitavel: string
          pixList: { brcode: string }
          beneficiario: { nome: string, cpf: string }
        }>(`${this.configService.get<string>('API_URL_BASE')}/${num}?pix=1`, {
          headers: {
            accept: 'application/json',
            token: this.configService.get<string>('API_TOKEN'),
            senhaApi: this.configService.get<string>('API_PASS'),
          },
        });
        const devedor = await this.devedoresRepository.findOneBy({ cpf: fatura.data.beneficiario.cpf })
        let idDev = null
        if (devedor) {
          idDev = devedor.id
        }
        console.log({
          i: this.i,
          codigo: fatura.data.codigo,
          valor: fatura.data.valorCobranca,
          vencimento: fatura.data.dataVencimento,
          linkFatura: fatura.data.linkFatura,
          codigoBarras: fatura.data.linhaDigitavel,
          codigoPix: fatura.data.pixList.brcode,
          devedor: idDev,
          nome: fatura.data.beneficiario.nome
        })
        return {
          codigo: fatura.data.codigo,
          valor: fatura.data.valorCobranca,
          vencimento: fatura.data.dataVencimento,
          linkFatura: fatura.data.linkFatura,
          codigoBarras: fatura.data.linhaDigitavel,
          codigoPix: fatura.data.pixList.brcode,
          devedor: idDev,
          nome: fatura.data.beneficiario.nome,
          cpf: fatura.data.beneficiario.cpf
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.log('rl');
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        throw error;
      }
    }
  }

  async getFaturasApi() {
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
    const numFaturas = resp.data.slice(0, 4)
    console.log(numFaturas)

    const respFaturas = await Promise.all(
      numFaturas.map(async (num: string) =>
        this.limite.schedule(async () => {
          const fatura = await this.buscarFatura(num);
          return fatura;
        }),
      ),
    );

    
    return respFaturas;
    }

    async asyncDbFaturas() {
      const faturasApi = await this.getFaturasApi();
      const faturasDb = await this.faturasRepository.find();

      for (const faturaDb of faturasDb) {
        const existeNaApi = faturasApi.some(
          (faturaApi) => faturaApi.codigo === faturaDb.codigo,
        );

        if (!existeNaApi) {
          await this.faturasRepository.remove(faturaDb);
        }
      }

      for (const faturaApi of faturasApi) {
        const existeNoDb = faturasDb.some(
          (faturaDb) => faturaDb.codigo === faturaApi.codigo,
        );

        if (!existeNoDb) {
          const novaFatura = this.faturasRepository.create(faturaApi);
          await this.faturasRepository.save(novaFatura);
        }
      }
    }

    async getFaturasDb () {
      return await this.faturasRepository.find()
    }

    async deleteAll() {
        await this.faturasRepository.deleteAll()
    }
}