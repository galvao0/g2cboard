import { Module } from "@nestjs/common";
import { DevedoresController } from "./devedores.controller.js";
import { DevedorEntity } from "./devedor.entity.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FaturasEntity } from "../faturas/faturas.entity.js";
import { DevedoresService } from "./devedores.service.js";

@Module({
    imports: [DevedorEntity, FaturasEntity, TypeOrmModule.forFeature([DevedorEntity, FaturasEntity])],
    controllers: [DevedoresController],
    providers: [DevedoresService],
    exports: [DevedorEntity]
})
export class DevedoresModule {}