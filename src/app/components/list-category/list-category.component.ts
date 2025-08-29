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

  // State for new category creation
  newCategoryName: string = '';
  message: string = '';
  isSuccess: boolean = true;

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

  ngOnInit(): void {
    console.log(
      'ListCategoryComponent: ngOnInit - Initializing categories listener.'
    );
    this.listenForCategories();
  }

  ngOnDestroy(): void {
    console.log(
      'ListCategoryComponent: ngOnDestroy - Unsubscribing from data.'
    );
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  listenForCategories() {
    console.log(
      'listenForCategories: Setting isLoading=true, clearing categories. Current isLoading:',
      this.isLoading
    );
    this.isLoading = true;
    this.categories = [];
    this.endOfData = false;

    const dataFetchPromise = new Promise<ICategory[]>((resolve, reject) => {
      const q = query(this.dataService.categoryRef(), orderBy('name'));

      this.unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          console.log('onSnapshot: Data received from Firestore.');
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
            'onSnapshot: Error fetching real-time categories:',
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
          'listenForCategories: Data loaded and minimum time elapsed. isLoading set to false. Categories count:',
          this.categories.length
        );
      })
      .catch((error) => {
        console.error(
          'listenForCategories: Error during data loading or minimum time delay:',
          error
        );
        this.isLoading = false;
        this.endOfData = true;
      });
  }

  // --- New Category Creation Methods ---
  async addCategory() {
    const trimmedCategoryName = this.newCategoryName.trim();
    console.log(
      'addCategory: Attempting to add category:',
      trimmedCategoryName
    );

    if (!trimmedCategoryName) {
      this.message = 'Category name cannot be empty.';
      this.isSuccess = false;
      return;
    }

    try {
      const exists = await this.dataService.checkCategoryExists(
        trimmedCategoryName
      );
      if (exists) {
        this.message = `Category "${trimmedCategoryName}" already exists.`;
        this.isSuccess = false;
        return;
      }

      const categoryData: Omit<ICategory, 'id'> = {
        name: trimmedCategoryName,
        description: `User-created category: ${trimmedCategoryName}`,
        color: this.getRandomColor(),
      };

      await this.dataService.addCategory(categoryData);
      this.message = `Category "${trimmedCategoryName}" added successfully!`;
      this.isSuccess = true;
      this.newCategoryName = ''; // Clear the input field

      console.log(
        'addCategory: Category added successfully. Triggering refresh.'
      );
      this.listenForCategories();
      setTimeout(() => {
        this.message = '';
      }, 1000);
    } catch (error: any) {
      console.error('addCategory: Error adding category:', error);
      this.message = 'Failed to add category. Please try again.';
      this.isSuccess = false;
      setTimeout(() => {
        this.message = '';
      }, 1000);
    }
  }

  // Get a random pastel-like color to Category.
  // private getRandomColor(): string {
  //   const colors = [
  //     '#F4CCCC',
  //     '#B4C6D9',
  //     '#F7D9C4',
  //     '#D5E8D4',
  //     '#EAD1DC',
  //     '#FFD700',
  //     '#ADD8E6',
  //     '#90EE90',
  //     '#FFB6C1',
  //     '#DDA0DD',
  //     '#AEC6CF',
  //     '#FDFD96',
  //     '#836953',
  //     '#77DD77',
  //     '#CFCFC4',
  //   ];
  //   return colors[Math.floor(Math.random() * colors.length)];
  // }

  private getRandomColor(): string {
    return '#5a5a5aff';
  }

  // --- Edit Category Methods ---
  openEditModal(category: ICategory, event: MouseEvent) {
    event.stopPropagation();
    console.log('openEditModal: Opening modal for category:', category.name);
    this.editingCategory = { ...category };
    this.editedCategoryName = category.name;
    this.editMessage = '';
    this.showEditModal = true;
  }

  closeEditModal() {
    console.log('closeEditModal: Closing edit modal.');
    this.showEditModal = false;
    this.editingCategory = null;
    this.editedCategoryName = '';
    this.editMessage = '';
  }

  async saveEditedCategory() {
    const trimmedEditedName = this.editedCategoryName.trim();
    console.log(
      'saveEditedCategory: Attempting to save edited category:',
      trimmedEditedName
    );

    if (!this.editingCategory || !trimmedEditedName) {
      this.editMessage = 'Category name cannot be empty.';
      this.isEditSuccess = false;
      return;
    }

    if (this.editingCategory.name === trimmedEditedName) {
      this.editMessage = 'No changes made.';
      this.isEditSuccess = true;
      setTimeout(() => this.closeEditModal(), 1000);
      return;
    }

    const categoryIdToUpdate = this.editingCategory.id!;

    try {
      const exists = await this.dataService.checkCategoryExists(
        trimmedEditedName,
        categoryIdToUpdate
      );
      if (exists) {
        this.editMessage = `Category "${trimmedEditedName}" already exists. Please choose a different name.`;
        this.isEditSuccess = false;
        console.warn(
          'saveEditedCategory: Duplicate category found. Keeping modal open.'
        );
        return;
      }

      this.closeEditModal();
      console.log(
        'saveEditedCategory: Closing modal, setting isLoading=true, clearing categories. Current isLoading:',
        this.isLoading
      );
      this.isLoading = true;
      this.categories = [];
      this.endOfData = false;

      await this.dataService.updateCategory(categoryIdToUpdate, {
        name: trimmedEditedName,
      });
      this.editMessage = 'Category updated successfully!';
      this.isEditSuccess = true;
      console.log(
        'saveEditedCategory: Category updated successfully. Triggering refresh.'
      );
      this.listenForCategories();
      setTimeout(() => {
        this.editMessage = '';
      }, 1000);
    } catch (error) {
      console.error('saveEditedCategory: Error saving edited category:', error);
      this.editMessage = 'Failed to update category. Please try again.';
      this.isEditSuccess = false;
      this.isLoading = false;
      this.endOfData = true;
      this.listenForCategories();
      setTimeout(() => {
        this.editMessage = '';
      }, 1000);
    }
  }

  // Delete Category Methods
  openDeleteConfirmModal(category: ICategory, event: MouseEvent) {
    event.stopPropagation();
    console.log(
      'openDeleteConfirmModal: Opening delete confirmation for category:',
      category.name
    );
    this.categoryToDelete = category;
    this.deleteMessage = '';
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirmModal() {
    console.log('closeDeleteConfirmModal: Closing delete confirmation modal.');
    this.showDeleteConfirmModal = false;
    this.categoryToDelete = null;
    this.deleteMessage = '';
  }

  async confirmDeleteCategory() {
    console.log(
      'confirmDeleteCategory: Attempting to delete category:',
      this.categoryToDelete?.name
    );
    if (!this.categoryToDelete || !this.categoryToDelete.id) {
      this.deleteMessage = 'Error: No category selected for deletion.';
      this.isDeleteSuccess = false;
      console.error(
        'confirmDeleteCategory: No category to delete or missing ID.'
      );
      return;
    }
    const categoryIdToDelete = this.categoryToDelete.id;

    // Trigger skeleton reload immediately
    this.closeDeleteConfirmModal();
    console.log(
      'confirmDeleteCategory: Closing modal, setting isLoading=true, clearing categories. Current isLoading:',
      this.isLoading
    );
    this.isLoading = true;
    this.categories = [];
    this.endOfData = false;

    try {
      await this.dataService.deleteCategory(categoryIdToDelete);
      this.deleteMessage = `Category "${this.categoryToDelete.name}" deleted successfully!`;
      this.isDeleteSuccess = true;
      console.log(
        'confirmDeleteCategory: Category deleted successfully. Triggering refresh.'
      );
      this.listenForCategories();
      setTimeout(() => {
        this.deleteMessage = '';
      }, 1000);
    } catch (error) {
      console.error('confirmDeleteCategory: Error deleting category:', error);
      this.deleteMessage = 'Failed to delete category. Please try again.';
      this.isDeleteSuccess = false;
      this.isLoading = false;
      this.endOfData = true;
      this.listenForCategories();
      setTimeout(() => {
        this.deleteMessage = '';
      }, 1000);
    }
  }
}
