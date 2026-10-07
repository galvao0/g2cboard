import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-template',
  templateUrl: './template.html',
  styleUrl: './template.scss',
  imports: [RouterOutlet, MatSidenavModule, MatIcon, MatDivider, RouterLink],
})
export class Template {
  constructor(public router: Router) {}
  getTitulo() {
    if (this.router.url === '/') return 'Dashboard';
    return '';
  }
}
