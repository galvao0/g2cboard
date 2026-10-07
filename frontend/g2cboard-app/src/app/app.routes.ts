import { Routes } from '@angular/router';
import { Template } from './template/template';
import { Board } from './board/board';
import { ListaDevedores } from './lista-devedores/lista-devedores';
import { Graficos } from './graficos/graficos';

export const routes: Routes = [
  {
    path: '',
    component: Template,
    children: [
      {
        path: '',
        component: Board,
      },
      {
        path: 'listadevedores',
        component: ListaDevedores
      },
      {
        path: 'graficos',
        component: Graficos
      }
    ],
  },
];
