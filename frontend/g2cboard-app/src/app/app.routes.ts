import { Routes } from '@angular/router';
import { Template } from './template/template';
import { Board } from './board/board';

export const routes: Routes = [
  {
    path: '',
    component: Template,
    children: [
      {
        path: '',
        component: Board,
      },
    ],
  },
];
