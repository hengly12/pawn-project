import { Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  writeBatch,
} from '@angular/fire/firestore';
import { IProfile } from '../interfaces/profile.interface';
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
      `example`
    ) as CollectionReference<any>;
  }

  collectionRef(collectionName: collectionEnum) {
    return collection(this.db, collectionName);
  }

  userRef() {
    return collection(this.db, `users`) as CollectionReference<any>;
  }

  customerRef() {
    return collection(this.db, `customer`) as CollectionReference<any>;
  }

}
