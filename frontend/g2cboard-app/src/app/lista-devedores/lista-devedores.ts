import {
  LucideArrowUpDown,
  LucideChevronDown,
  LucideChevronUp,
  LucideCopy,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUsers,
} from '@lucide/angular';
import { DevedoresService } from '../service/devedores/devedores-service';
import { Component, inject } from '@angular/core';

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
    LucideArrowUpDown,
  ],
})
export class ListaDevedores {
  svc = inject(DevedoresService);
}
