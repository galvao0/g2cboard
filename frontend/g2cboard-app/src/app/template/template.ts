import { Component } from "@angular/core";
import { RouterOutlet } from "../../../node_modules/@angular/router/types/_router_module-chunk";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'app-template',
    templateUrl: './template.html',
    styleUrl: './template.scss',
    imports: [RouterOutlet, MatIconModule]
})

export class Template {}