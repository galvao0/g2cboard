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

  devedorAbertoId: string | null = null;

  paginaAtual = 1;
  itensPagina = 10;

  get devedoresPaginados(): devedorResp[] {
    const inicio = (this.paginaAtual - 1) * this.itensPagina;

    return this.devedores.slice(inicio, inicio + this.itensPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.devedores.length / this.itensPagina);
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.devedorAbertoId = null;
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.devedorAbertoId = null;
    }
  }

  openDetalhes(devedorId: string): void {
    if (this.devedorAbertoId === devedorId) {
      this.devedorAbertoId = null;
    } else {
      this.devedorAbertoId = devedorId;
    }
  }

  copy(): void {
    navigator.clipboard.writeText('p');
  }

  ngOnInit(): void {
    this.devedoresService.getDevedores().subscribe({
      next: (data: any) =>  {
        data = Array.from(data)
        this.devedores = (data);
        this.paginaAtual = 1;
        this.devedorAbertoId = null;
        console.log(this.devedores)
        console.log(this.devedores.length)
      },
      error: (err) => console.error(err),
    });
  }
}
