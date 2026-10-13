import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DevedoresModule } from './devedor/devedores.module.js';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevedorEntity } from './devedor/devedor.entity.js';
import { FaturasModule } from './faturas/faturas.module.js';
import { FaturasEntity } from './faturas/faturas.entity.js';

@Module({
  imports: [DevedoresModule, FaturasModule, ConfigModule.forRoot({
    isGlobal: true
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '774805',
    database: 'devedores',
    entities: [DevedorEntity, FaturasEntity],
    autoLoadEntities: true,
    synchronize: true
  })
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
