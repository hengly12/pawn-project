import {
  DocumentData,
  DocumentSnapshot,
  FieldValue,
  GeoPoint,
  QuerySnapshot,
  Timestamp,
} from '@angular/fire/firestore';
import { IProfile } from '../interfaces/profile.interface';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { map, startWith } from 'rxjs';
import moment from 'moment';

export function assets(...path: string[]): string {
  return 'assets/' + path?.join('/');
}

export function docsToObject<T>(
  doc: DocumentSnapshot<T | DocumentData>
): T | null {
  if (!doc.exists()) return null;
  return { ...doc?.data() } as T;
}
export function pushToArray(doc: QuerySnapshot<DocumentData>): any[] {
  if (doc.empty) return [];
  return doc?.docs?.map((m) => {
    return { ...m.data() };
  });
}
export function docsToArray<T>(doc: QuerySnapshot<T | DocumentData>): T[] {
  if (doc.empty) return [];
  return doc?.docs?.map((m) => ({ ...m.data() })) as T[];
}
export function toUpperCaseTrim(name: string) {
  return `${name}`.replace(/\s/g, '').trim().toLocaleUpperCase();
}
export function pushToObject(doc: DocumentSnapshot<DocumentData>): any {
  if (!doc.exists) return null;
  return { ...doc?.data() };
}

export function compressImage(src: string, width: number, height: number) {
  return new Promise((res, rej) => {
    let newX = 480;
    let newY = 480;
    let reducePercent = 0;
    if (width > height) {
      if (width > 480) {
        reducePercent = 480 / width;
        newY = height * reducePercent;
      } else {
        res(src);
      }
    } else {
      if (height > 480) {
        reducePercent = 480 / height;
        newX = width * reducePercent;
      } else {
        res(src);
      }
    }
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const elem = document.createElement('canvas');
      elem.width = newX;
      elem.height = newY;
      const ctx = elem.getContext('2d');
      ctx?.drawImage(img, 0, 0, newX, newY);
      const data = ctx?.canvas.toDataURL();
      res(data);
    };
    img.onerror = (error) => rej(error);
  });
}

export function mapUser(user: any | null) {
  if (!user) return null;
  return {
    key: user?.key,
    displayName: user?.full_name || user?.displayName || null,
    photoURL: user.photoFile?.downloadUrl || null,
  };
}

export function UserMap(user: any | null) {
  if (!user) return null;
  return {
    key: user?.key || user?.uid || null,
    displayName: user?.full_name || user?.displayName || null,
    photoURL: user?.photoFile?.downloadUrl || user?.photoURL || null,
  };
}

export function formatFormDate(
  date?: Date | null | undefined | number | Timestamp | FieldValue | null
): Date | null | undefined {
  if (!date) return undefined;

  if (typeof date === 'number') {
    return moment(`${date}`, "YYYYMMDD").toDate();
  }

  if (date instanceof Timestamp) {
    return date.toDate();
  }

  if (typeof date === 'object' && 'isEqual' in date) {
    return new Date();
  }

  if (
    (typeof date === 'object' && Object.keys(date).length > 0 && moment(date).isValid()) ||
    (typeof date?.toString === 'function' && moment(date).isValid())
  ) {
    const objField = Object.keys(date);
    if (objField.includes("_seconds") || objField.includes("seconds")) {
      return moment.unix((date as any)._seconds || (date as any).seconds).toDate();
    }
    return moment(date).toDate();
  }

  if (typeof date === 'object' && Object.keys(date).length > 0) {
    const objField = Object.keys(date);
    if (objField.includes("_seconds") || objField.includes("seconds")) {
      return moment.unix((date as any)._seconds || (date as any).seconds).toDate();
    }
  }

  if (moment(date).isValid()) {
    return moment(date).toDate();
  }

  return undefined;
}

export function durationFromDate(fromDate: Date, toDate: Date): number {
  const m = moment(formatFormDate(toDate));
  return m.diff(formatFormDate(fromDate), 'days');
}
export function toGeoPoint(lat: number, lng: number) {
  return new GeoPoint(lat, lng);
}

export function fileValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const file = control.value;
    return file ? null : { requiredFile: true };
  };
}

export function enableForm<T extends FormGroup>(
  form: T,
  options?: { exclude: (keyof T['controls'])[] }
) {
  Object.keys(form.controls).map((key) => {
    const control = form.controls[key];
    if (options?.exclude?.includes(key)) return;
    control.enable();
  });
}

export function autoComplete(
  stateCtrl: AbstractControl,
  data: any,
  field: string | string[],
  checkField?: string
) {
  return stateCtrl.valueChanges.pipe(
    startWith(``),
    map((state) =>
      state
        ? filterStates(data, stateCtrl?.value, field, checkField)
        : data.slice().slice(0, 50)
    )
  );
}

export function convertToDate(value: any): Date | null {
  if (!value) return null;
  
  // Handle Firestore Timestamp
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  
  // Handle string date
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // Handle timestamp number
  if (typeof value === 'number') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's already a Date object
  if (value instanceof Date) {
    return value;
  }
  
  return null;
}

export function filterStates(
  data: any[],
  value: any,
  field: string | string[],
  checkField?: string
): any[] {
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