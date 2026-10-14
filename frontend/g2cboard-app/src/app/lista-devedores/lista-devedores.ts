import { Component, OnInit, inject } from "@angular/core";

@Component({
    selector: 'app-listadevedores',
    templateUrl: './lista-devedores.html',
    styleUrl: './lista-devedores.scss',
})
export class ListaDevedores {
    private devService = inject(DevedoresService);

    devedores: any[] = [];

    ngOnInit() {
        this.devService.getDevedores().subscribe({
            next: (data: any) => {
                this.devedores = data;
            },
            error: (err) => console.error(err)
        });
    }
}