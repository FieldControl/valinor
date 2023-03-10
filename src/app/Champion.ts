export interface Champion {
    version: Number,
    id: string,
    key: string,
    name: string,
    title: string,
    blurb: string,
    info:{
        attack: Number,
        defense: Number,
        magic: Number,
        difficulty: Number
    },
    image: {
        full: string,
        sprite: string,
        group: string,
        x: Number,
        y: Number,
        w: Number,
        h: Number
    },
    tags:[
        string,
        string
    ],
    partype: string,
    stats: {
        hp: Number,
        hpperlevel: Number,
        mp: Number,
        mpperlevel: Number,
        movespeed: Number,
        armor: Number,
        armorperlevel: Number,
        spellblock: Number,
        spellblockperlevel: Number,
        attackrange: Number,
        hpregen: Number,
        hpregenperlevel: Number,
        mpregen: Number,
        mpregenperlevel: Number,
        crit: Number,
        critperlevel: Number,
        attackdamage: Number,
        attackdamageperlevel: Number,
        attackspeedperlevel: Number,
        attackspeed: Number
    }
}


