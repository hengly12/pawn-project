import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../shared/services/data.service';
import { ICategory } from '../../shared/interfaces/category.interface';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './create-category.component.html',
  styleUrl: './create-category.component.scss',
})
export class CreateCategoryComponent implements OnInit {
  router = inject(Router);
  private dataService = inject(DataService);

  newCategoryName: string = '';
  message: string = '';
  isSuccess: boolean = true;

  ngOnInit(): void {}

  async addCategory() {
    const trimmedCategoryName = this.newCategoryName.trim();

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
      this.newCategoryName = '';
    } catch (error: any) {
      console.error('Error adding category:', error);
      this.message = 'Failed to add category. Please try again.';
      this.isSuccess = false;
    }
  }

  private getRandomColor(): string {
    const colors = [
      '#F4CCCC',
      '#B4C6D9',
      '#F7D9C4',
      '#D5E8D4',
      '#EAD1DC',
      '#FFD700',
      '#ADD8E6',
      '#90EE90',
      '#FFB6C1',
      '#DDA0DD',
      '#AEC6CF',
      '#FDFD96',
      '#836953',
      '#77DD77',
      '#CFCFC4',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
