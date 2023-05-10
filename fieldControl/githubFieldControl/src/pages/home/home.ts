import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  items = [
    { name: 'nodejs/node', language: 'JavaScript', msg: 'Node.js JavaScript runtime ✨🐢🚀✨' },
    { name: 'base-org/node', language: 'TypeScript', msg: 'Everything required to run your own Base node' },
    { name: 'goldbergyoni/nodebestpractices', language: 'HTML', msg: '✅ The Node.js best practices list (May 2023)'},
    { name: 'aan-network/node', language: 'CSS', msg: 'a secure, transparent, and peer-to-peer cloud computing network' },
    { name: 'teste1', language: 'Python', msg: 'Node fork to make it suitable for embedding in Electron' },
    { name: 'teste2', language: 'Java', msg: 'Google officially supported Node.js client library for accessing Google APIs. Support for authorization and authentication with OAuth 2…' },
    { name: 'node-fetch/node-fetch', language: 'C#', msg: 'A light-weight module that brings the Fetch API to Node.js' },
    { name: 'codespaces-examples/node', language: 'PHP', msg: 'A starter Node.js development environment for Codespaces' },
    { name: 'vpulim/node-soap', language: 'Ruby', msg: 'A SOAP client and server for node.js.' },
    { name: 'santiq/bulletproof-nodejs', language: 'Swift', msg: 'Implementation of a bulletproof node.js API 🛡️' },
    { name: 'nvm-sh/nvm', language: 'Kotlin', msg: 'Node Version Manager - POSIX-compliant bash script to manage multiple active node.js versions' },
    { name: 'NodeOS/NodeOS', language: 'Go', msg: 'Lightweight operating system using Node.js as userspace' },
    { name: 'testbailicangdu/node-elme9', language: 'Scala', msg: 'Backend system based on node.js + Mongodb. 基于 node.js + Mongodb 构建的后台系统' },
    { name: 'teste10', language: 'Rust', msg: 'A light-weight module that brings the Fetch API to Node.js' }
  ];
  currentPage = 1;
  pageSize = 5;
  paginatedItems: any[] = [];
  totalPages: number;
  searchTerm: string;

  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController
    ) {
      this.totalPages = Math.ceil(this.items.length / this.pageSize); 
      this.paginatedItems = this.items.slice(0, this.pageSize);  
      for (let i = 0; i < this.items.length; i++) {
        this.items[i]['randomNumber'] = Math.floor(Math.random() * 100);
      }
  }
  nextPage() {
    if (this.currentPage * this.pageSize < this.items.length) {
      this.currentPage++;
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;

      // Atualiza a lista paginada com os itens da nova página
      this.paginatedItems = this.items.slice(startIndex, endIndex);
    }
  }
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;

      this.paginatedItems = this.items.slice(startIndex, endIndex);
    }
  }
  filterItems() {
    this.items = this.items.filter(item => {
      return item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }
  openRepositorio() {
    this.navCtrl.push('RepositorioPage');
  }
  filter() {
      const modal = this.modalCtrl.create('FilterPage');
      modal.present();
  }
 

 }

