import { Controller, Get } from "@nestjs/common";
import { FaturasService } from "./faturas.service.js";

@Controller('/faturas')
export class FaturasController {
    constructor(private readonly faturasService: FaturasService) {}
    @Get()
    getFaturas(): any {
        return this.faturasService.asyncDbFaturas()
    }
}