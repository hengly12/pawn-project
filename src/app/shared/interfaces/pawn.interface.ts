export interface IPAWNSHOP {
    key: string;
    created_at: any;
    created_by: any
    updated_at: any;
    updated_by: any
    date_key: number;
    status: any;
    keywords: string[];
    isDeleted: boolean;
    
    full_name: string;
    gender: any;
    phone_number: number;
    id_card: number;
    address: string;
    dateOfBirth: any;
    dateOfBirthKey: any;

    pawn_type: any;
    photo: any;

    type_car?: any;
    type_motor?:any;

    others?:any;

    plate_car?: any;
    plate_motor?: any;

    type_phone?: any;
    type_phone_name?: any;
    type_phone_id?:any;

    type_jewelry_name?: any;
    type_jewelry_text?: any;
    gold_weight?: any;

    price_interest: any;
    price_pawn: any;
    

}
