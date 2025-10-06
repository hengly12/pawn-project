import { Routes } from '@angular/router';
import { PawnFormComponent } from '../components/pawn-form/pawn-form.component';
import { ReportRouterComponent } from '../components/report-router/report-router.component';
import { ReportComponent } from '../components/report/report.component';
import { ExpiredCustomerComponent } from '../components/expired-customer/expired-customer.component';
import { LayoutWrapperComponent } from './layout-wrapper/layout-wrapper.component';
import { ListingComponent } from './listing/listing.component';
import { CreateCategoryComponent } from '../components/create-category/create-category.component';
import { ListCategoryComponent } from '../components/list-category/list-category.component';
import { CategoryComponent } from '../components/category/category.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: LayoutWrapperComponent,
    children: [
      {
        path: '',
        redirectTo: 'active/listing',
        pathMatch: 'full',
      },
      {
        path: ':statusKey/listing',
        component: ListingComponent,
        children: [
          {
            path: 'create-form/:id',
            component: PawnFormComponent,
          },
        ],
      },

      {
        path: 'report',
        component: ReportRouterComponent,
        children: [
          { path: 'data-customer', component: ReportComponent },

          {
            path: 'data-expired-customer',
            component: ExpiredCustomerComponent,
          },
        ],
      },
      {
        path: 'category',
        component: CategoryComponent,
        children: [
          { path: 'list-category', component: ListCategoryComponent },
          { path: 'create-category', component: CreateCategoryComponent },
        ],
      },
    ],
  },
  
];

export async function getPrerenderParams_home_listing(): Promise<Record<string, string>[]> {
  // Return the known, static parameter values for :statusKey
  return [
    { statusKey: 'active' },
    { statusKey: 'inactive' }
  ];
}
