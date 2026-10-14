import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaturasEntity } from "./faturas.entity.js";

@Injectable()
export class FaturasService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FaturasEntity)
    private readonly faturasRepository: Repository<FaturasEntity>,
  ) {}

  private limite = new Bottleneck({
    reservoir: 50,
    reservoirRefreshAmount: 50,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 5,
    minTime: 1200,
  });

  private async buscarFatura(num: string) {
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
        console.log({
            codigo: fatura.data.codigo,
          valor: fatura.data.valorCobranca,
          vencimento: fatura.data.dataVencimento,
          linkFatura: fatura.data.linkFatura,
          codigoBarras: fatura.data.linhaDigitavel,
          codigoPix: fatura.data.pixList.brcode,
          devedor: fatura.data.beneficiario.nome
        })
        return {
          codigo: fatura.data.codigo,
          valor: fatura.data.valorCobranca,
          vencimento: fatura.data.dataVencimento,
          linkFatura: fatura.data.linkFatura,
          codigoBarras: fatura.data.linhaDigitavel,
          codigoPix: fatura.data.pixList.brcode,
          devedor: fatura.data.beneficiario.nome,
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

  async getFaturas() {
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
        try {
            const faturasResp = await this.getFaturas()
            const faturasDb = await this.faturasRepository.find()

            for (const fatura of faturasResp) {
                const faturaExiste = await this.faturasRepository.findOneBy({ codigo: fatura.codigo })
                console.log(faturaExiste)

                if (!faturaExiste) {
                    const faturaDb = this.faturasRepository.create(fatura)
                    await this.faturasRepository.save(faturaDb)
                }
            }
        } catch (error) {
            return error
        }
    }

    async deleteAll() {
        await this.faturasRepository.deleteAll()
    }
}