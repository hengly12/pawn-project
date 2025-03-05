import { Injectable, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthStore } from '../../auth/auth.store';
import { deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore';
import { collectionData } from '@angular/fire/firestore';
import { interval, map, Observable, switchMap } from 'rxjs';
import { pushToArray, pushToObject, toUpperCaseTrim } from '../services/mapping.service';
import { STATUS_OBJ } from '../dummy/config';
@Injectable({
  providedIn: 'root',
})
export class PawnStore {
  constructor(private ds: DataService, private auth: AuthStore) {}
  process = signal<boolean>(false); 
  createCustomer(item: any, callback: (success: boolean, result: any) => void) {
    this.process.set(true);
    const batch = this.ds.batchRef();
    const ref = doc(this.ds.customerRef(), item.key);

    batch.set(ref, item, { merge: true });
    batch
      .commit()
      .then(() => {
        callback(true, null);
      })
      .catch((error) => {
        alert(error);
        callback(false, error);
      })
      .finally(() => {
        this.process.set(false);
      });
  }

  fetchListing( statusKey: any) {
    const queryRef = [
      where('status.key', '==', statusKey),
      orderBy('created_at', 'desc'),
      limit(20),
    ];
    return collectionData(
      query(this.ds.customerRef(), ...queryRef)
    ) as Observable<any[]>;
  }

  async getCustomer(key: string) {
    return pushToObject(
      await getDoc(doc(this.ds.customerRef(), key))
    );
  }

  deleteCustomer(key: string) {
    return deleteDoc(doc(this.ds.customerRef(), key));
  }

  updateStatusInactive(data: any) {
    return updateDoc(doc(this.ds.customerRef(), data.key), {
      status: STATUS_OBJ.DISABLED,
    });
  }

}
