import { Injectable, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthStore } from '../../auth/auth.store';
import {
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { collectionData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import {
  pushToArray,
  pushToObject,
  toUpperCaseTrim,
} from '../services/mapping.service';
import { STATUS_OBJ } from '../dummy/config';

@Injectable({
  providedIn: 'root',
})
export class PawnStore {
  // Signal to hold the count of expired pawns. This is a public signal
  // that the MainHeaderComponent will subscribe to.
  expiredPawnCount = signal<number>(0);

  constructor(private ds: DataService, private auth: AuthStore) {
    // This will fetch the initial count when the service is created.
    this.checkExpiredItems();
  }

  // Method to fetch the expired items and update the signal.
  // This can be called from any component that needs to refresh the count.
  async checkExpiredItems() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // This query uses your existing `getExpiredPawnItems` logic
      const expiredItems = await this.getExpiredPawnItems(today);
      this.expiredPawnCount.set(expiredItems.length);
    } catch (error) {
      console.error('Error fetching expired pawn items:', error);
      // You can set the count to 0 or handle the error as needed
      this.expiredPawnCount.set(0);
    }
  }

  process = signal<boolean>(false);

  async createCustomerinfo(data: any, info_customer: any) {
    try {
      this.process.set(true);
      const batch = this.ds.batchRef();
      const ref = doc(this.ds.customerRef(), data?.key);
      const ref_info_customer = doc(
        this.ds.infoCustomerRef(),
        info_customer?.key
      );
      batch.set(ref, data, { merge: true });
      batch.set(ref_info_customer, info_customer, { merge: true });
      await batch.commit();
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  async getExpiredPawnItems(date = new Date()): Promise<any[]> {
    const queryRef = [
      where('date_expired', '<', date), // Changed from '>=' to '<'
      where('status.key', '==', STATUS_OBJ.ACTIVE.key),
      orderBy('created_at', 'desc'),
    ];
    return firstValueFrom(
      collectionData(query(this.ds.customerRef(), ...queryRef))
    );
  }

  async createCustomer(data: any, info_customer: any) {
    try {
      this.process.set(true);
      const batch = this.ds.batchRef();
      const ref = doc(this.ds.customerRef(), data?.key);
      const ref_info_customer = doc(
        this.ds.infoCustomerRef(),
        info_customer?.key
      );
      batch.set(ref, data, { merge: true });
      batch.set(ref_info_customer, info_customer, { merge: true });
      await batch.commit();
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  async createCustomerinfoNews(data: any, info_update: any) {
    try {
      this.process.set(true);
      const batch = this.ds.batchRef();
      const ref = doc(this.ds.customerRef(), data?.key);
      const ref_info_customer = doc(
        this.ds.infoCustomerRef(),
        info_update?.key
      );
      batch.set(ref, data, { merge: true });
      batch.set(ref_info_customer, info_update, { merge: true });
      await batch.commit();
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  async createCustomerEdit(data: any) {
    try {
      this.process.set(true);
      const batch = this.ds.batchRef();
      const ref = doc(this.ds.customerRef(), data?.key);
      batch.set(ref, data, { merge: true });
      await batch.commit();
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  fetchListing(statusKey: any) {
    const queryRef = [
      where('status.key', '==', statusKey),
      orderBy('created_at', 'desc'),
      limit(20),
    ];
    return collectionData(
      query(this.ds.customerRef(), ...queryRef)
    ) as Observable<any[]>;
  }

  fetchListingPaginated(
    statusKey: number,
    pageLimit: number,
    startAfterDoc: QueryDocumentSnapshot<any> | null
  ) {
    const constraints: any[] = [
      where('status.key', '==', statusKey),
      orderBy('created_at', 'desc'),
      limit(pageLimit),
    ];
    if (startAfterDoc) {
      constraints.splice(2, 0, startAfter(startAfterDoc));
    }
    const q = query(this.ds.customerRef(), ...constraints);
    return new Observable<{
      data: any[];
      last: QueryDocumentSnapshot<any> | null;
    }>((observer) => {
      getDocs(q)
        .then((snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            key: doc.id,
            ...doc.data(),
          }));
          const last =
            snapshot.docs.length > 0
              ? snapshot.docs[snapshot.docs.length - 1]
              : null;
          observer.next({ data: docs, last });
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  fetchListingExpiredDate(dateExpired: any) {
    const queryRef = [
      where('date_expired', '==', dateExpired),
      orderBy('created_at', 'desc'),
      limit(30),
    ];
    return collectionData(
      query(this.ds.customerRef(), ...queryRef)
    ) as Observable<any[]>;
  }

  fetchInfoListing() {
    const queryRef = [orderBy('created_at', 'desc'), limit(50)];
    return collectionData(
      query(this.ds.infoCustomerRef(), ...queryRef)
    ) as Observable<any[]>;
  }

  getCustomerDemo(): Observable<any[]> {
    return collectionData(this.ds.customerRef());
  }

  async getCustomer(key: string) {
    return pushToObject(await getDoc(doc(this.ds.customerRef(), key)));
  }

  async getCustomerInFo(key: string) {
    return pushToObject(await getDoc(doc(this.ds.infoCustomerRef(), key)));
  }

  deleteCustomer(key: string) {
    return updateDoc(doc(this.ds.customerRef(), key), {
      status: STATUS_OBJ.DELETED,
    });
  }

  updateStatusInactive(data: any) {
    return updateDoc(doc(this.ds.customerRef(), data.key), {
      status: STATUS_OBJ.DISABLED,
    });
  }

  updateItemStatus(itemKey: string, newStatus: number): Observable<void> {
    return new Observable((observer) => {
      updateDoc(doc(this.ds.customerRef(), itemKey), {
        'status.key': newStatus,
      })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  async searchListing(search: string, statusKey: any): Promise<any> {
    const ref = this.ds.customerRef();
    const queryConstraints = [
      where('keywords', 'array-contains', toUpperCaseTrim(search)),
      where('status.key', '==', statusKey),
      orderBy('created_at', 'desc'),
      limit(20),
    ];
    const appQuery = query(ref, ...queryConstraints);
    return pushToArray(await getDocs(appQuery));
  }

  async endPawn(key: string): Promise<void> {
    try {
      await updateDoc(doc(this.ds.customerRef(), key), {
        status: STATUS_OBJ.DISABLED,
      });
      console.log('Pawn ended successfully.');
    } catch (error) {
      console.error('Error ending pawn:', error);
      throw error;
    }
  }

  async restorePawn(key: string): Promise<void> {
    try {
      await updateDoc(doc(this.ds.customerRef(), key), {
        status: STATUS_OBJ.ACTIVE,
      });
      console.log('Restore Pawn successfully.');
    } catch (error) {
      console.error('Error Restore Pawn:', error);
      throw error;
    }
  }

  async updatePawnData(key: string, updatedData: any): Promise<void> {
    try {
      this.process.set(true);
      await updateDoc(doc(this.ds.customerRef(), key), updatedData);
      console.log(`Pawn data with key ${key} updated successfully.`);
    } catch (error) {
      console.error(`Error updating pawn data with key ${key}:`, error);
      throw error;
    } finally {
      this.process.set(false);
    }
  }
}
