import { Controller, Get } from "@nestjs/common";
import { DevedoresService } from "./devedores.service.js";

@Controller('devedores')
export class DevedoresController {
    constructor(private readonly devedoresService: DevedoresService) {}
    @Get()
    getFaturas() {
    }
    @Get('/sincronizar')
    sincronizarDevedores() {
    }
    async findAll() {
        await this.faturasService.asyncDbFaturas();
        await this.sincronizarDevedores();

        return this.devedorRepository.find({
            relations: {
                faturas: true,
            },
        });
                              
    }
}