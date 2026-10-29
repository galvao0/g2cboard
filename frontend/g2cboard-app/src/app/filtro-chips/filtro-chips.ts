import { Component, input, output } from '@angular/core';

export interface OpcaoFiltro {
  valor: string;
  rotulo: string;
}

@Component({
  selector: 'app-filtro-chips',
  templateUrl: './filtro-chips.html',
  styleUrl: './filtro-chips.scss',
})
export class FiltroChips {
  opcoes = input.required<OpcaoFiltro[]>();
  valor = input.required<string>();
  rotulo = input('');
  mudou = output<string>();
}
