import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let KanbanService = class KanbanService {
    http;
    apiUrl = 'http://localhost:3000';
    constructor(http) {
        this.http = http;
    }
    // Colunas
    getColunas() {
        return this.http.get(`${this.apiUrl}/tb_coluna`);
    }
    criarColuna(coluna) {
        console.log('Enviando requisição para criar coluna:', coluna);
        return this.http.post(`${this.apiUrl}/tb_coluna`, coluna);
    }
    editarColuna(id, coluna) {
        return this.http.put(`${this.apiUrl}/tb_coluna/${id}`, coluna);
    }
    deletarColuna(id) {
        return this.http.delete(`${this.apiUrl}/tb_coluna/${id}`);
    }
    // Cards
    getCards() {
        return this.http.get(`${this.apiUrl}/tb_card`);
    }
    criarCard(card) {
        console.log('Enviando requisição para criar card:', card);
        return this.http.post(`${this.apiUrl}/tb_card`, card);
    }
    atualizarCard(id, card) {
        return this.http.put(`${this.apiUrl}/tb_card/${id}`, card);
    }
    editarCard(id, card) {
        return this.http.put(`${this.apiUrl}/tb_card/${id}`, card);
    }
    deletarCard(id) {
        return this.http.delete(`${this.apiUrl}/tb_card/${id}`);
    }
};
KanbanService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], KanbanService);
export { KanbanService };
