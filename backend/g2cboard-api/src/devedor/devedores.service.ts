import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import Bottleneck from "bottleneck";
import { DevedorResponse } from "./dto/devedor-response.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DevedorEntity } from "./devedor.entity.js";

@Injectable()
export class DevedoresService {
    
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(DevedorEntity)
        private readonly devedorRepository: Repository<DevedorEntity>
    ) {}

    private limite = new Bottleneck({
        reservoir: 199,
        reservoirRefreshAmount: 199,
        reservoirRefreshInterval: 60 * 1000,
        maxConcurrent: 10,
        minTime: 300
    })

    private async getDevedoresApi() {
        const resp = await axios.get(`${this.configService.get<string>('API_URL_BASE')}/procurarPorVencida`, {
            headers: {
                'accept': 'application/json',
                'token': this.configService.get<string>('API_TOKEN'),
                'senhaApi': this.configService.get<string>('API_PASS')
            },
        })
        const numFaturas = resp.data

        const respDevedores = await Promise.all(numFaturas.map(async (num: string) => this.limite.schedule(async () => {
            const fatura = await axios.get<{valorCobranca: number, beneficiario: {nome: string}}>(`${this.configService.get<string>('API_URL_BASE')}/${num}`, {
                headers: {
                    'accept': 'application/json',
                    'token': this.configService.get<string>('API_TOKEN'),
                    'senhaApi': this.configService.get<string>('API_PASS')
                },
            })
            return { nome: fatura.data.beneficiario.nome, saldoDevedor: fatura.data.valorCobranca}
        })))

        return respDevedores
    }

    async sincronizarDevedores() {
        const devedores = this.getDevedoresApi()
        console.log(devedores)
        ;(await devedores).map(async (devedor) => {
            const devedorExiste = await this.devedorRepository.findOneBy({ nome: devedor.nome })

            if (!devedorExiste) {
                const dev = await this.devedorRepository.create({ nome: devedor.nome, saldoDevedor: devedor.saldoDevedor })
                return this.devedorRepository.save(dev)
            }
        })
    }

    async getDevedores () {
        return await this.devedorRepository.find()
    }
}