import { Routes } from '@angular/router';
import { AuthGuard, canActivate, redirectLoggedInTo, redirectUnauthorizedTo, } from '@angular/fire/auth-guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterFormComponent } from './auth/register-form/register-form.component';
import { AuthComponent } from './auth/auth.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { LayoutWrapperComponent } from './layout/layout-wrapper/layout-wrapper.component';
import { ListingComponent } from './layout/listing/listing.component';
import { PawnFormComponent } from './components/pawn-form/pawn-form.component';
import { ReportRouterComponent } from './components/report-router/report-router.component';
import { ExpiredCustomerComponent } from './components/expired-customer/expired-customer.component';
import { ReportComponent } from './components/report/report.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth']);
const redirectLoggedInToRoot = () => redirectLoggedInTo(['']);

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    loadChildren: () =>
      import('./layout').then((m) => m.routes),
    ...canActivate(redirectUnauthorizedToLogin),

  },
  {
    path: 'auth',
    component: AuthComponent,
    loadChildren: () =>
      import('./auth').then((m) => m.routes),
    ...canActivate(redirectLoggedInToRoot),

  },
];

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
