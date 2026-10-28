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
  totalDevedor: number;
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
  ultimosDevedores: devedorResp[] = []

  devedorAbertoId: string | null = null;

  paginaAtual = 1;
  itensPagina = 10;
  totalDevedor = 0
  totalRecebido = 0

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

  copy(code: string): void {
    navigator.clipboard.writeText(code);
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

        this.devedores.map((d) => {
          d.faturas.map((f) => {
            if (f.status === "paga") {
              this.totalRecebido += Number(f.valor)
            } else {
              this.totalDevedor += Number(f.valor)
            }

            if (f.vencimento.slice(6) === '2026') {
              if (this.ultimosDevedores.length < 3) {
                this.ultimosDevedores.push(d)
              }
            }
          })
        })
        console.log(this.ultimosDevedores)
      },
      error: (err) => console.error(err),
    });
  }

  Number(v: any): Number {
    return Number(v)
  }

  toMoney(v: any) {
    const formatter = new Intl.NumberFormat('pt-BR');

    return formatter.format(v)
  }

  checkStatusDevedor(faturas: any[]) {
    let totalFaturasPagas = 0

    faturas.map((f) => {
      if (f.status === "paga") {
        totalFaturasPagas++
      }
    })

    if(totalFaturasPagas === faturas.length) {
      return "Em Dia"
    }

    return "Em Atraso"
  }
}
