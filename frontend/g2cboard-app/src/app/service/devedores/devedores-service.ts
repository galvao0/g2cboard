import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: "root"
})
export class DevedoresService {
    private http = inject(HttpClient);

    private url = "";

    getUsers() {
        return this.http.get(this.url);
    }
}