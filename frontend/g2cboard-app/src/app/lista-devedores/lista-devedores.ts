import { Component, OnInit, inject } from "@angular/core";
import { DevedoresService } from "../service/devedores/devedores-service";
import { LucideAArrowDown, LucideChevronDown, LucideChevronUp, LucideCopy } from "@lucide/angular";

@Component({
    selector: 'app-listadevedores',
    templateUrl: './lista-devedores.html',
    styleUrl: './lista-devedores.scss',
    imports: [LucideChevronDown, LucideChevronUp, LucideCopy]
})
export class ListaDevedores {
    private devedoresService = inject(DevedoresService);

    devedores: any[] = [];
    openFaturas!: boolean

    openDetalhes() {
        this.openFaturas = !this.openFaturas
    }

    ngOnInit() {
        this.devedoresService.getDevedores().subscribe({
            next: (data: any) => {
                this.devedores = data;
            },
            error: (err) => console.error(err)
        });
    }
}