
import { Component, OnInit, inject } from '@angular/core';
import { DevedoresService } from '../service/devedores/devedores-service';
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideCopy,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUsers,
} from '@lucide/angular';

export interface devedorResp {
  id: string;
  cpf: string;
  nome: string;
  totalDevedor: string;
  faturas: any[];
}

@Component({
  selector: 'app-listadevedores',
  templateUrl: './lista-devedores.html',
  styleUrl: './lista-devedores.scss',
  imports: [
    LucideChevronDown,
    LucideChevronUp,
    LucideCopy,
    LucideUsers,
    LucideTrendingDown,
    LucideTrendingUp,
  ],
})
export class ListaDevedores implements OnInit {
  private devedoresService = inject(DevedoresService);

  devedores: devedorResp[] = [];

  openFaturas = false;
  paginaAtual = 1;
  itensPorPagina = 10;

  get devedoresPaginados(): devedorResp[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;

    return this.devedores.slice(
      inicio,
      inicio + this.itensPorPagina
    );
  }

  get totalPaginas(): number {
    return Math.ceil(this.devedores.length / this.itensPorPagina);
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.openFaturas = false;
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.openFaturas = false;
    }
  }

  openDetalhes(): void {
    this.openFaturas = !this.openFaturas;
  }

  copy(): void {
    navigator.clipboard.writeText('p');
  }

  ngOnInit(): void {
    this.devedoresService.getDevedores().subscribe({
      next: (data: devedorResp[]) => {
        this.devedores = data;
        this.paginaAtual = 1;
      },
      error: (err) => console.error(err),
    });
  }
}
