import { Component, inject } from '@angular/core';
import { DevedoresService } from '../service/devedores/devedores-service';
import {
  LucideArrowUp,
  LucideChevronDown,
  LucideChevronUp,
  LucideCopy,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUsers,
} from '@lucide/angular';
import { CurrencyPipe, DatePipe } from '@angular/common';

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
    LucideArrowUp,
    DatePipe,
    CurrencyPipe,
  ],
})
export class ListaDevedores {
  devService = inject(DevedoresService);
}
