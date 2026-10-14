import { Controller, Get } from "@nestjs/common";
import { DevedoresService } from "./devedores.service.js";

@Controller('devedores')
export class DevedoresController {
    constructor(
        private readonly devedoresService: DevedoresService
    ) {}
    @Get()
    async getDevedores(): Promise<any> {
        return await this.devedoresService.getDevedores()
    }
}