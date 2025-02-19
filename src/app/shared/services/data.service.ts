import { Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  writeBatch,
} from '@angular/fire/firestore';
import { INotification } from '../interfaces/notification.interface';
import { IProfile } from '../interfaces/profile.interface';
import { IResident } from '../interfaces/residence.interface';
import { ICheckIn } from '../interfaces/checkin.interface';
import { ICommune, ICountry, IDistrict, IGeo, IProvince, IVillage } from '../interfaces/geo.interface';
import { collectionEnum } from '../dummy/app';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private db: Firestore) {}

  batchRef() {
    return writeBatch(this.db);
  }

  collectionDocRef(collectionName: collectionEnum, id: string) {
    return doc(this.db, `${collectionName}/${id}`);
  }

  // createKey() {
  //   return doc(this.ownerForeignerRef()).id;
  // }
  createKey(collectionName?: string) {
    const docRef = collection(this.db, collectionName || 'users');
    const { id } = doc(docRef);
    return id;
  }

  notificationsRef() {
    return collection(
      this.db,
      `notifications`
    ) as CollectionReference<INotification>;
  }

  collectionRef(collectionName: collectionEnum) {
    return collection(this.db, collectionName);
  }

  userRef() {
    return collection(this.db, `users`) as CollectionReference<any>;
  }

  residenceRef() {
    return collection(this.db, `owner_homes`) as CollectionReference<IResident>;
  }

  ownersRef() {
    return collection(this.db, `owners`) as CollectionReference<IResident>;
  }

  ownerForeignerStayRef() {
    return collection(
      this.db,
      `owner_foreigner_stays`
    ) as CollectionReference<ICheckIn>;
  }

  closeRecord() {
    return collection(
      this.db,
      `close_records`
    ) as CollectionReference<any>;
  }

  owner_homes_accountsRef() {
    return collection(this.db, `owner_homes_accounts`) as CollectionReference<any>;
  }

  ownerForeignerRef() {
    return collection(
      this.db,
      `owner_foreigners`
    ) as CollectionReference<ICheckIn>;
  }

  countryRef() {
    return collection(this.db, `countries`) as CollectionReference<ICountry>;
  }

  residentRef() {
    return collection(this.db, `resident_categories`) as CollectionReference<any>;
  }

  createId(collectionName?: string) {
    const docRef = collection(this.db, collectionName || 'users');
    const { id } = doc(docRef);
    return id;
  }

  
  countriesRef() {
    return collection(this.db, collectionEnum.countries);
  }

  provincesRef() {
    return collection(
      this.db,
      collectionEnum.geo_provinces
    ) as CollectionReference<IProvince>;
  }

  districtsRef() {
    return collection(
      this.db,
      collectionEnum.geo_districts
    ) as CollectionReference<IDistrict>;
  }

  communesRef() {
    return collection(
      this.db,
      collectionEnum.geo_communes
    ) as CollectionReference<ICommune>;
  }

  villagesRef() {
    return collection(
      this.db,
      collectionEnum.geo_villages
    ) as CollectionReference<IVillage>;
  }
}
