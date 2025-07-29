import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../shared/services/data.service';
import { ICategory } from '../../shared/interfaces/category.interface';
import { onSnapshot, query, orderBy } from '@angular/fire/firestore';
import { Unsubscribe } from 'firebase/firestore';
import { MatTabNavPanel } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-list-category',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatTabNavPanel,
    MatProgressBarModule,
  ],
  templateUrl: './list-category.component.html',
  styleUrl: './list-category.component.scss',
})
export class ListCategoryComponent implements OnInit, OnDestroy {
  router = inject(Router);
  private dataService = inject(DataService);

  categories: ICategory[] = [];
  isLoading: boolean = true;
  endOfData: boolean = false;

  private unsubscribe: Unsubscribe | undefined;
  private minimumLoadTimeMs: number = 2000;

  // State for edit modal
  showEditModal: boolean = false;
  editingCategory: ICategory | null = null;
  editedCategoryName: string = '';
  editMessage: string = '';
  isEditSuccess: boolean = true;

  // State for delete confirmation modal
  showDeleteConfirmModal: boolean = false;
  categoryToDelete: ICategory | null = null;
  deleteMessage: string = '';
  isDeleteSuccess: boolean = true;

  constructor() {
    console.log('ListCategoryComponent: Constructor called.');
  }

  ngOnInit(): void {
    console.log(
      'ListCategoryComponent: ngOnInit called. Starting data listener.'
    );
    this.listenForCategories();
  }

  ngOnDestroy(): void {
    console.log(
      'ListCategoryComponent: ngOnDestroy called. Unsubscribing from data.'
    );
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  listenForCategories() {
    console.log(
      'ListCategoryComponent: listenForCategories called. Setting isLoading to true.'
    );
    this.isLoading = true;
    this.categories = [];
    this.endOfData = false;

    const dataFetchPromise = new Promise<ICategory[]>((resolve, reject) => {
      const q = query(this.dataService.categoryRef(), orderBy('name'));

      this.unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          console.log('ListCategoryComponent: onSnapshot callback triggered.');
          const fetchedCategories: ICategory[] = [];
          querySnapshot.forEach((doc) => {
            fetchedCategories.push({
              id: doc.id,
              ...(doc.data() as ICategory),
            });
          });
          resolve(fetchedCategories);
        },
        (error) => {
          console.error(
            'ListCategoryComponent: Error fetching real-time categories:',
            error
          );
          reject(error);
        }
      );
    });

    const minTimePromise = new Promise<void>((resolve) =>
      setTimeout(resolve, this.minimumLoadTimeMs)
    );

    Promise.all([dataFetchPromise, minTimePromise])
      .then(([fetchedCategories]) => {
        this.categories = fetchedCategories;
        this.isLoading = false;
        this.endOfData = true;

        console.log(
          'ListCategoryComponent: Data loaded and min time elapsed. isLoading:',
          this.isLoading,
          'categories.length:',
          this.categories.length
        );
        console.log('Real-time categories updated:', this.categories);

        if (this.categories.length === 0) {
          console.log(
            'ListCategoryComponent: No categories found in Firestore.'
          );
        }
      })
      .catch((error) => {
        console.error(
          'ListCategoryComponent: Error during data loading or minimum time delay:',
          error
        );
        this.isLoading = false;
        this.endOfData = true;
      });
  }

  // Edit Category Methods
  openEditModal(category: ICategory, event: MouseEvent) {
    event.stopPropagation();
    console.log('openEditModal called for category:', category.name);
    this.editingCategory = { ...category };
    this.editedCategoryName = category.name;
    this.editMessage = '';
    this.showEditModal = true;
  }

  closeEditModal() {
    console.log('closeEditModal called.');
    this.showEditModal = false;
    this.editingCategory = null;
    this.editedCategoryName = '';
    this.editMessage = '';
  }

  async saveEditedCategory() {
    if (!this.editingCategory || !this.editedCategoryName.trim()) {
      this.editMessage = 'Category name cannot be empty.';
      this.isEditSuccess = false;
      return;
    }

    try {
      await this.dataService.updateCategory(this.editingCategory.id!, {
        name: this.editedCategoryName.trim(),
      });
      this.editMessage = 'Category updated successfully!';
      this.isEditSuccess = true;
      setTimeout(() => this.closeEditModal(), 2000);
    } catch (error) {
      console.error('Error saving edited category:', error);
      this.editMessage = 'Failed to update category. Please try again.';
      this.isEditSuccess = false;
    }
  }

  // Delete Category Methods
  openDeleteConfirmModal(category: ICategory, event: MouseEvent) {
    console.log(
      '1. openDeleteConfirmModal called for category:',
      category.name
    );
    event.stopPropagation();
    this.categoryToDelete = category;
    this.deleteMessage = '';
    this.showDeleteConfirmModal = true;
    console.log(
      '2. showDeleteConfirmModal set to true. Modal should now be visible.'
    );
  }

  closeDeleteConfirmModal() {
    console.log('closeDeleteConfirmModal called. Hiding modal.');
    this.showDeleteConfirmModal = false;
    this.categoryToDelete = null;
    this.deleteMessage = '';
  }

  async confirmDeleteCategory() {
    console.log(
      '3. confirmDeleteCategory called. Checking categoryToDelete:',
      this.categoryToDelete?.name
    );
    if (!this.categoryToDelete || !this.categoryToDelete.id) {
      this.deleteMessage = 'Error: No category selected for deletion.';
      this.isDeleteSuccess = false;
      console.error('Error: categoryToDelete is null or has no ID.');
      return;
    }

    try {
      console.log(
        '4. Attempting to delete category with ID:',
        this.categoryToDelete.id
      );
      await this.dataService.deleteCategory(this.categoryToDelete.id);
      console.log('5. Category deleted successfully!');

      this.deleteMessage = `Category "${this.categoryToDelete.name}" deleted successfully!`;
      this.isDeleteSuccess = true;

      setTimeout(() => this.closeDeleteConfirmModal(), 2000);
    } catch (error) {
      console.error('Error deleting category:', error);
      this.deleteMessage = 'Failed to delete category. Please try again.';
      this.isDeleteSuccess = false;
    }
  }
}
