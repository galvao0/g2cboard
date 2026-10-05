import { Module } from "@nestjs/common";
import { DevedoresService } from "./devedores.service.js";
import { DevedoresController } from "./devedores.controller.js";
import { DevedorEntity } from "./devedor.entity.js";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [DevedorEntity, TypeOrmModule.forFeature([DevedorEntity])],
    controllers: [DevedoresController],
    providers: [DevedoresService],
})
export class DevedoresModule {}