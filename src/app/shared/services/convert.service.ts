import moment from 'moment';
import _ from 'lodash';
import { map, startWith } from 'rxjs';
import { AbstractControl } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';

export function toDateKey(date: Date) {
  return Number(moment(date).format('YYYYMMDD'));
}

// export function toDate(date: string) {
//   return Number(moment(date).format('YYYY-MM-DD'));
// }

// export function convertDOB(date?: Date | string): { dob_dd: number | null; dob_mm: number | null; dob_yyyy: number | null } {
//   // Convert date to a Date object if it's a string
//   if (typeof date === 'string') {
//     date = new Date(date);
//   }

//   // Check if the date is valid
//   if (date instanceof Date && !isNaN(date.getTime())) {
//     return {
//       dob_dd: date.getDate(),
//       dob_mm: date.getMonth() + 1, // Months are 0-based, so add 1
//       dob_yyyy: date.getFullYear(),
//     };
//   } else {
//     // Return null if the date is invalid
//     return {
//       dob_dd: null,
//       dob_mm: null,
//       dob_yyyy: null,
//     };
//   }
// }


export function convertDOB(date?: Date) {
  return {
    dob_dd: date?.getDate(),
    dob_mm: date?.getMonth() ? date?.getMonth() + 1 : date?.getMonth(),
    dob_yyyy: date?.getFullYear(),
  };
}

export function numberToDate(date: number) {
  if (!date) return null;
  return moment(date, 'YYYYMMDD').toDate();
}

export function getUniqId(formValue: any) {
  if (!formValue) return null;

  const formattedDateOfBirth = formatFormDate(formValue?.dateOfBirth);
  const dateOfBirthKey = formattedDateOfBirth ? toDateKey(formattedDateOfBirth) : formValue?.dateOfBirthKey;
  const { dob_dd, dob_mm, dob_yyyy } = dateOfBirthKey
    ? convertDOB(numberToDate(dateOfBirthKey!)!)
    : ({} as any);

  const first_name = (formValue?.givenName || "")?.trim()?.split(/\s+/)?.join('-').toUpperCase();
  const last_name = (formValue?.surname || "")?.trim()?.split(/\s+/)?.join('-').toUpperCase();

  return [
    first_name || '-',
    last_name || '-',
    dob_dd ? String(dob_dd).padStart(2, '0') : '-',
    dob_mm ? String(dob_mm).padStart(2, '0') : '-',
    dob_yyyy || '-', 
    formValue?.passportNumber || '-',
    formValue?.nationality?.alpha_3_code || '-',
  ].join('_');
}

function formatFormDate(
  date?: Date | null | undefined | number | Timestamp | { seconds?: number; _seconds?: number } | any
): Date | null | undefined {
  if (!date) return undefined;

  if (typeof date === 'number') {
    return moment(`${date}`, "YYYYMMDD").toDate();
  }

  if (date instanceof Timestamp) {
    return date.toDate();
  }

  if (typeof date === 'object' && (date.seconds || date._seconds)) {
    const seconds = date.seconds || date._seconds;
    return moment.unix(seconds).toDate();
  }

  if (typeof date === 'string' || date instanceof Date) {
    if (moment(date).isValid()) {
      return moment(date).toDate();
    }
  }

  return undefined;
}

export function toCapitalize(value: any) {
  let string = null;
  if (value && value !== '') string = value.toString().toUpperCase().trim();
  return string;
}

export const createKeywords = (name: any) => {
  let arrName: any = [];
  let curName = '';
  let nextName = '';
  String(name)
    .trim()
    .split(/[ .\-_ ]/)
    .forEach((letter) => {
      curName += letter;
      arrName.push(toCapitalize(letter));
      arrName.push(toCapitalize(curName));
    });

  String(name)
    .split('')
    .forEach((letter) => {
      nextName += letter;
      arrName.push(toCapitalize(nextName));
    });

  return arrName;
};

export function generateKeywords(names: string[]) {
  const keywordName = _.flattenDeep(
    _.map(names, (m: any) => createKeywords(m))
  ).filter((a: any) => a);
  return [...new Set(['~N/A~', ...keywordName])];
}

export function pageKey() {
  return Number(moment().format('YYYYMMDDHHmmss'));
}

export function autoCompleteAsync<T>(
  stateCtrl: AbstractControl,
  data: T[],
  field: keyof T | (keyof T)[],
  checkField?: string
) {
  return stateCtrl.valueChanges.pipe(
    startWith(``),
    map((state) =>
      state
        ? filterStatesAsync(data, stateCtrl?.value, field, checkField)
        : data.slice().slice(0, 50)
    )
  );
}

export function filterStatesAsync<T>(
  data: T[],
  value: string,
  field: keyof T | (keyof T)[],
  checkField?: string
): T[] {
  if (typeof value === 'object') {
    return data.slice(0, 50);
  }
  return data
    ?.filter((state) => {
      if (!state) return null;
      if (Array.isArray(field)) {
        return field.some((f) => {
          return (
            state[f] &&
            `${state[f]}`?.toLowerCase().indexOf(`${value?.toLowerCase()}`) > -1
          );
        });
      } else {
        return (
          state[field] &&
          `${state[field]}`?.toLowerCase().indexOf(`${value?.toLowerCase()}`) >
            -1
        );
      }
    })
    .slice(0, 50);
}

export function getYear(date: Date, date2?: Date) {
  return date2
    ? moment(date2).diff(date, 'years')
    : moment().diff(date, 'years');
}

export function getMonth(date: Date, date2?: Date) {
  return date2
    ? moment(date2).diff(date, 'months')
    : moment().diff(date, 'months');
}

export function getDay(date: Date, date2?: Date) {
  return date2 ? moment(date2).diff(date, 'days') : moment().diff(date, 'days');
}

// export function getCurrentGeoLocation(): Promise<GeolocationPosition> {
//   //check if geolocation is not available
//   if (!navigator.geolocation) {
//     alert('Geolocation is not supported by your browser');
//   }
//   //check if geolocation is not allow
//   if (!navigator.permissions) {
//     alert('Geolocation is not supported by your browser');
//     //request permission
//     (navigator.permissions as any)
//       .query({ name: 'geolocation' })
//       .then((result: { state: string; onchange: () => void }) => {
//         if (result.state === 'granted') return;
//         if (result.state === 'prompt') {
//           alert('Please allow location access');
//           return;
//         }
//         if (result.state === 'denied') {
//           alert('Please allow location access');
//           return;
//         }
//         result.onchange = function () {
//           console.log(result.state);
//         };
//       });
//   }
//   return new Promise((res, rej) => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         res(position);
//       },
//       (error) => {
//         alert('Please allow location access');
//         rej(error);
//       }
//     );
//   });
// }

export function getCurrentGeoLocation(): Promise<GeolocationPosition | null> {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    (navigator.permissions as any).query({ name: 'geolocation' }).then((result: { state: string; onchange: () => void }) => {
      if (result.state === 'granted') {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            alert('Please allow location access');
            resolve(null);
          }
        );
      } else {
        alert('Please allow location access');
        resolve(null); 
      }
      result.onchange = function () {
        console.log(result.state);
      };
    });
  });
}
