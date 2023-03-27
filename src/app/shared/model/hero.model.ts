export interface Hero {
    id: number;
    name: string;
    localized_name: string;
    primary_attr: string;
    attack_type: string;
    roles: string[];
    img: string;
    base_str: number;    
    base_int: number;    
    base_agi: number;    
    agi_gain: number;
    str_gain: number;
    int_gain: number;
    abilities: any[];
    name_abilities: any[];
    new_Id: number;
}
