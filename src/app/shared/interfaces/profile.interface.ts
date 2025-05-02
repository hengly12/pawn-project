export interface IProfile {
  key: string;
  created_at: any;
  created_by: any;
  updated_by: any;
  updated_at: any;

  passportNumber: any;
  dateOfPassportExpired: any;
  dateOfPassportExpiredKey: any;
  surname: any;
  givenName: any;
  gender: any;
  placeOfBirth: any;
  nationality: any;
  dateOfBirth: any;
  dateOfBirthKey: any;
  passportFile: any;
  homeKeys: any;
  

  username: any;
  passCode: any;
  passCodeVerify: any;
  homeKey: string;

  photoFile: any;
  files: any[];
  keyword: any;

  phoneNumber: string | null;
  phone: string | null;
  country: any;
  selectedHomeKey?: any;
  displayName?: string;

  email?: string;

  role: {
    key: number;
    name: string;
  };
  full_name: string;
}
