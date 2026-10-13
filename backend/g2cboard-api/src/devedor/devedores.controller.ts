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
}