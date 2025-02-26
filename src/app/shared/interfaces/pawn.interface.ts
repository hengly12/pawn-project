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
    first_name: string;
    last_name: string;  
    gender: any;
    phone_number: number;
    id_card: number;
    address: string;
    dateOfBirth: any;
    dateOfBirthKey: any; // format date to 20250226
    dateOfExpire: any;
    dateOfExpireKey: any;  // format date to 20250226

    pawn_type: any;
    photo: any;

    type_car?: any;
    type_motor?:any;

    plate_car?: any;
    plate_motor?: any;

    price_interest: any;
    price_pawn: any;
}
