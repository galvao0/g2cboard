import { Module } from "@nestjs/common";
import { DevedorEntity } from "../devedor/devedor.entity.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FaturasEntity } from "./faturas.entity.js";
import { FaturasService } from "./faturas.service.js";
import { FaturasController } from "./faturas.controller.js";

@Module({
    imports: [DevedorEntity, TypeOrmModule.forFeature([FaturasEntity, DevedorEntity])],
    providers: [FaturasService],
    controllers: [FaturasController]
})

export class FaturasModule {}