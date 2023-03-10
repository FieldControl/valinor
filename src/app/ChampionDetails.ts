export interface ChampionDetails{
    id: string,
    key: string,
    name: string,
    title: string,
    image: {
        full: string,
        sprite: string,
        group: string,
        x: number,
        y: number,
        w: number,
        h: number
      }
    skins: {
        id: number,
        num: number,
        name: string,
        chromas: boolean
    }[]
    lore: string,
    spells: {
        id: string,
        name: string,
        description: string,
        cooldownBurn: string,
        cost: string,
        costBurn: string
    }[]
    passive: {
        name: string,
        description: string,
        image:{
            full: string
        }
    }


  
}