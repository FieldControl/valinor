import { Component, OnInit } from '@angular/core';
import { Vehicle } from 'src/app/shared/vehicle.models';
import { VehicleService } from './vehicle.service';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss'],
})
export class VehicleComponent implements OnInit {
  vehicles: Vehicle[] = [];
  count: number = 0;
  page: number = 1;
  search: string;
  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.getData();
  }
  //Busca as informações do Serviço do component, enviando as informações de parametros
  getData() {
    this.vehicleService
      .getVehicles(this.search, this.page)
      .subscribe((data) => {
        this.count = data.count;
        this.vehicles = data.results;
      });
  }
  //Muda o valor da página para ser aplicada a requisição
  pageChange(event: number): void {
    this.page = event;
    this.getData();
  }
}
