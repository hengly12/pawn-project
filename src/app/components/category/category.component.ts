import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabNavPanel } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-category',
  imports: [RouterModule, MatTabNavPanel, MatIconModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  router = inject(Router);
}
