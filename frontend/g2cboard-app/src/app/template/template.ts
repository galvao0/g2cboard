import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDivider } from '@angular/material/divider';
import { LucideLayoutDashboard, LucideRefreshCcw, LucideUsers } from '@lucide/angular';
import { DevedoresService } from '../service/devedores/devedores-service';

@Component({
  selector: 'app-template',
  templateUrl: './template.html',
  styleUrl: './template.scss',
  imports: [
    LucideLayoutDashboard,
    LucideRefreshCcw,
    RouterOutlet,
    MatSidenavModule,
    MatIcon,
    MatDivider,
    RouterLink,
    RouterLinkActive,
    LucideUsers,
  ],
})
export class Template {
  svc = inject(DevedoresService);
  private router = inject(Router);

  getTitulo() {
    if (this.router.url === '/') return 'Dashboard';
    else if (this.router.url === '/listadevedores') return 'Lista de Devedores';
    return '';
  }

  onBusca(valor: string) {
    this.svc.setBusca(valor);
    if (valor && !this.router.url.startsWith('/listadevedores')) {
      this.router.navigateByUrl('/listadevedores'); // busca na dashboard leva para a lista
    }
  }
}
