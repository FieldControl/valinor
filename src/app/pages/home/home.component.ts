import { Component, OnInit } from "@angular/core";
import { CryptoCardComponent } from "../../components/crypto-card/crypto-card.component";
import { CoinMarketCapAPIService } from "../../services/coin-market-cap-api.service";
import { CryptoCoin } from "../../models/crypto-coin";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CryptoCardComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  crypto: CryptoCoin | any;
  
  constructor(private service: CoinMarketCapAPIService) {}
  
  ngOnInit(): void {
    this.service.getCryptoData().subscribe({
      next: (response: CryptoCoin) => {
        this.crypto = response
        console.log(this.crypto)
      }
    })
  }
}
