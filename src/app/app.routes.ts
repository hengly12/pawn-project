import { Routes } from '@angular/router';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

import { LoginComponent } from './auth/login/login.component';
import { RegisterFormComponent } from './auth/register-form/register-form.component';
import { AuthComponent } from './auth/auth.component';

import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { LayoutWrapperComponent } from './layout/layout-wrapper/layout-wrapper.component';
import { ListingComponent } from './layout/listing/listing.component';

import { PawnFormComponent } from './components/pawn-form/pawn-form.component';
import { ReportRouterComponent } from './components/report-router/report-router.component';
import { ExpiredCustomerComponent } from './expired-customer/expired-customer.component';
import { ReportComponent } from './components/report/report.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'auth',
        component: AuthComponent,
        canActivate: [AuthGuard],
        data: { authGuardPipe: () => redirectLoggedInTo(['']) },
        children: [
          { path: '', redirectTo: 'login', pathMatch: 'full' },
          { path: 'login', component: LoginComponent },
          { path: 'register', component: RegisterFormComponent },
        ],
      },
      {
        path: '',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        data: { authGuardPipe: () => redirectUnauthorizedTo(['auth']) },
        children: [
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

              // {
              //   path: 'report',
              //   component: ReportComponent,
              //   children: [

              //   ],
              // },

              // {path: 'report/data-expired-customer',
              //   component: ExpiredCustomerComponent,
              //   children:[

              //   ]
              // }
            ],
          },
        ],
      },
    ],
  },
];
