import { Injectable, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthStore } from '../../auth/auth.store';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, startAfter, updateDoc, where, } from 'firebase/firestore';
import { collectionData } from '@angular/fire/firestore';
import { interval, map, Observable, switchMap } from 'rxjs';
import { pushToArray, pushToObject, toUpperCaseTrim, } from '../services/mapping.service';
import { STATUS_OBJ } from '../dummy/config';

@Injectable({
  providedIn: 'root',
})

export class PawnStore {
  constructor(private ds: DataService, private auth: AuthStore) {}

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


  // async createCustomerinfo(data: any, info_customer: any) {
  //   try {
  //     this.process.set(true);
  //     const batch = this.ds.batchRef();
  //     const ref = doc(this.ds.customerRef(), data?.key);
  //     const ref_info_customer = doc(
  //       this.ds.infoCustomerRef(),
  //       info_customer?.key
  //     );

  //     batch.set(ref, data, { merge: true });
  //     batch.set(ref_info_customer, info_customer, { merge: true });
  //     await batch.commit();
  //   } catch (error) {
  //     console.error('Batch operation failed:', error);
  //     throw error;
  //   }
  // }

  // async createCustomer(data: any) {
  //   try {
  //     this.process.set(true);
  //     const batch = this.ds.batchRef();
  //     const ref = doc(this.ds.customerRef(), data?.key);

  //     batch.set(ref, data, { merge: true });
  //     await batch.commit();
  //   } catch (error) {
  //     console.error('Batch operation failed:', error);
  //     throw error;
  //   }
  // }

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
}
