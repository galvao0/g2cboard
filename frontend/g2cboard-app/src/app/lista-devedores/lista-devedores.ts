import { Component, OnInit, inject } from '@angular/core';
import { DevedoresService } from '../service/devedores/devedores-service';
import {
  LucideAArrowDown,
  LucideChevronDown,
  LucideChevronUp,
  LucideCopy,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUsers,
} from '@lucide/angular';

export interface devedorResp {
  id: string,
  cpf: string
  nome: string
  totalDevedor: string
  faturas: any[]
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
export class ListaDevedores {
  private devedoresService = inject(DevedoresService);

  devedores!: devedorResp[];
  openFaturas!: boolean;

  openDetalhes() {
    this.openFaturas = !this.openFaturas;
  }

  copy() {
    navigator.clipboard.writeText('p');
  }

  ngOnInit() {
    this.devedoresService.getDevedores().subscribe({
      next: (data: any) => {
        this.devedores = (data);
        
      },
      error: (err) => console.error(err),
    });
    this.devedores.forEach((dev) => {
      console.log(dev.nome)
    })
  }
}
