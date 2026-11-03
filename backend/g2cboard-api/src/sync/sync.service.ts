import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FaturasService } from '../faturas/faturas.service.js';
import { DevedoresService } from '../devedor/devedores.service.js';

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  private rod = false;

  constructor(
    private readonly faturasService: FaturasService,
    private readonly devedoresService: DevedoresService,
  ) {}

  onApplicationBootstrap() {
    void this.sync();
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async sync() {
    if (this.rod) return;
    this.rod = true;
    try {
      await this.faturasService.asyncDbFaturas();
      await this.devedoresService.sincronizarDevedores();
    } catch (e) {
      console.error('Falha na sincronização', e);
    } finally {
      this.rod = false;
    }
  }
}
