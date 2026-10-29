import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FaturasService } from '../faturas/faturas.service.js';
import { DevedoresService } from '../devedor/devedores.service.js';

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  private rodando = false;

  constructor(
    private readonly faturas: FaturasService,
    private readonly devedores: DevedoresService,
  ) {}

  onApplicationBootstrap() {
    void this.sincronizar();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sincronizar() {
    if (this.rodando) return;
    this.rodando = true;
    try {
      await this.faturas.asyncDbFaturas();
      await this.devedores.sincronizarDevedores();
    } catch (e) {
      console.error('Falha na sincronização', e);
    } finally {
      this.rodando = false;
    }
  }
}
