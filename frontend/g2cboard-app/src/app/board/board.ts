import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideArrowDownFromLine, LucideBanknoteArrowDown, LucideChevronDown, LucideCopy, LucideTrendingDown, LucideTrendingUp, LucideUsers } from '@lucide/angular';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
  imports: [LucideArrowDownFromLine, LucideUsers, LucideTrendingDown, LucideTrendingUp, LucideCopy, LucideBanknoteArrowDown, LucideChevronDown],
})
export class Board {
  constructor(private readonly router: Router) {}
  openFaturas!: boolean

  openDetalhes() {
    this.openFaturas = !this.openFaturas
  }
  open() {
    this.router.navigateByUrl('/listadevedores')
  }
}
