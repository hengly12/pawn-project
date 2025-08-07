import { Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  writeBatch,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { ICategory } from '../interfaces/category.interface';
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

  createKey(collectionName?: string) {
    const docRef = collection(this.db, collectionName || 'users');
    const { id } = doc(docRef);
    return id;
  }

  notificationsRef() {
    return collection(this.db, `example`) as CollectionReference<any>;
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

  infoCustomerRef() {
    return collection(this.db, `info_customer`) as CollectionReference<any>;
  }

  categoryRef() {
    return collection(this.db, `category`) as CollectionReference<ICategory>;
  }

  /**
   * Checks if a category with the given name already exists, optionally excluding a specific ID.
   * @param categoryName
   * @param excludeId
   * @returns
   */
  async checkCategoryExists(categoryName: string, excludeId?: string): Promise<boolean> {
    try {
      let q = query(this.categoryRef(), where('name', '==', categoryName));

      // If an excludeId is provided, add a condition to exclude that document
      if (excludeId) {

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.some(doc => doc.id !== excludeId);
      } else {
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
      }
    } catch (e) {
      console.error('Error checking for duplicate category:', e);
      throw e;
    }
  }

  /**
   * Adds a new category document to the 'category' collection.
   * @param categoryData
   * @returns
   */
  async addCategory(categoryData: Omit<ICategory, 'id'>) {
    try {
      const docRef = await addDoc(this.categoryRef(), categoryData);
      console.log('Document written with ID: ', docRef.id);
      return docRef;
    } catch (e) {
      console.error('Error adding document: ', e);
      throw e;
    }
  }

  /**
   * Updates an existing category document in the 'category' collection.
   * @param id
   * @param data
   */
  async updateCategory(id: string, data: Partial<ICategory>) {
    try {
      const categoryDocRef = doc(this.db, `category/${id}`);
      await updateDoc(categoryDocRef, data);
      console.log(`Category with ID ${id} updated successfully.`);
    } catch (e) {
      console.error(`Error updating category with ID ${id}:`, e);
      throw e;
    }
  }

  /**
   * Deletes a category document from the 'category' collection.
   * @param id
   */
  async deleteCategory(id: string) {
    try {
      const categoryDocRef = doc(this.db, `category/${id}`);
      await deleteDoc(categoryDocRef);
      console.log(`Category with ID ${id} deleted successfully.`);
    } catch (e) {
      console.error(`Error deleting category with ID ${id}:`, e);
      throw e;
    }
  }
}
