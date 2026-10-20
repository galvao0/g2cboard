import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { devedorResp } from '../../lista-devedores/lista-devedores';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class DevedoresService {
    private http = inject(HttpClient);

    private url = "http://localhost:3000/devedores";

    getDevedores(): Observable<devedorResp> {
        return this.http.get<devedorResp>(this.url);
    }
}