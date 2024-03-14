import { Injectable } from '@nestjs/common';
import { BadgesService } from './badges/badges.service';

@Injectable()
export class BadgeInit{
    constructor(private readonly badgeService: BadgesService) { }

    async initBadgesIfNeeded() {
        const badges = await this.badgeService.findAll();
        if (badges.length === 0) {
            const data = [
                { name: "Novo", color: "#A9DEF9" },
                { name: "Defeito", color: "#FF99C8" },
                { name: "Documentação", color: "#E4C1F9" },
                { name: "Fácil", color: "#D0F4DE" },
                { name: "Médio", color: "#FCF6BD" },
                { name: "Dificil", color: "#FAC8D6" },
            ];
            await Promise.all(data.map(badge => this.badgeService.create(badge)));
        }
    }
}
