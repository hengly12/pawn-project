import { assets } from '../services/mapping.service';

export const Languages = {
  km: {
    key: 'km',
    name: 'ភាសាខ្មែរ',
    icon: assets('logo/cambodia_flag_circle.png'),
    flag: assets('logo/cambodia_flag_circle.png'),
  },
  en: {
    key: 'en',
    name: 'English',
    icon: assets('logo/english_flag_circle.png'),
    flag: assets('logo/english_flag_circle.png'),
  },
  zh: {
    key: 'zh',
    name: '中文',
    icon: assets('logo/china.png'),
    flag: assets('logo/china.png'),
  },
} as const;

export const LanguagesArray = Object.values(Languages);
export const DefaultLanguage = Languages.km;

type LanguageKey = keyof typeof Languages;
export function getLanguageObject(key: LanguageKey) {
  return Languages[key] || DefaultLanguage;
}

export const PHOTO_LIB = {
  EMPTY:
    'https://firebasestorage.googleapis.com/v0/b/sysanotta.appspot.com/o/no_image.svg?alt=media&token=f25af902-6c62-47e6-bdf3-48e3b0c6fe8c',
  EMPTY_PHOTO:
    'https://firebasestorage.googleapis.com/v0/b/ecpp-auxswot.appspot.com/o/photo%2Fempty_image.jpeg?alt=media&token=53a1095a-e2f4-48e7-930f-ded6be1eecc8',
  EMPTY_COVER: '/src/assets/images/GDI-Doc-Cover-2.jpg',
  PDF: 'https://firebasestorage.googleapis.com/v0/b/doccamwin.appspot.com/o/file_icons%2Fpdf.svg?alt=media&token=d7a5750b-410d-43e1-8bdc-17a698bfa3b8',
  EMPTY_PASSPORT: '',
  EMPTY_AVATAR: '../../../assets/images/no_avatar.jpeg',
};

export const STATUS_OBJ = {
  DISABLED: { key: -2, text: 'Disabled' },
  DELETED: { key: -1, text: 'Deleted' },
  CANCEL: { key: .5, text: 'CANCEL' },
  ACTIVE: { key: 1, text: 'Active' },
  PENDING: { key: 2, text: 'Pending' },
  CHECKED_IN: { key: 3, text: 'CHECKED_IN' },
  EXTENDED: { key: 4, text: 'EXTENDED' },
  CHECK_OUT: { key: 5, text: 'CHECK_OUT' },
  ENDED_PAWN: {key: 6, text: 'Ended Pawn'},
};

export const NOTIFY_OBJ = {
  APPROVED: { key: 1, text: 'HOME_APPROVED' },
  CHECK_IN: { key:2, text: 'Foreigner Check In' },
};

export const GENDER_DATA = [
  { key: 0, text: 'ប្រុស', en_name: 'Male' },
  { key: 1, text: 'ស្រី', en_name: 'Female' },
  { key: 2, text: 'ដទៃទៀត', en_name: 'Other' },
];

export const ITEM_DATA = [
  { key: 0, text: 'Car',},
  { key: 1, text: 'Phone', },
  { key: 2, text: 'Motor', },
  { key: 3, text: 'Jewelry', },
  { key: 4, text: 'Others', },
];

export const STAY_STATUS = {
  staying: { key: 'staying', text: 'Staying' },
  checkout: { key: 'checkout', text: 'Check Out' },
};

export const ROLE_OBJ = {
  OWNER: { key: 1, name: 'Owner' },
  MANAGER: { key: 2, name: 'Manager' },
  STAFF: { key: 2.5, name: 'Staff' },
  USER: { key: 3, name: 'User' },
};

export const REGISTER_TYPE = {
  PHONE: { key: 1, name: 'Phone Number'}
}
