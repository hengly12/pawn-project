import { Routes } from '@angular/router';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { LoginComponent } from './auth/login/login.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { AuthComponent } from './auth/auth.component';
import { LayoutWrapperComponent } from './layout/layout-wrapper/layout-wrapper.component';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { ReportComponent } from './components/report/report.component';


export const routes: Routes = [
  // {
  //   path: 'auth',
  //   component: AuthComponent,
  //   data: { authGuardPipe: () => redirectLoggedInTo(['/']) },
  //   canActivate: [AuthGuard],
  //   children: [
  //     { path: '', redirectTo: 'login', pathMatch: 'full' },
  //     {
  //       path: 'login',
  //       component: LoginComponent,
  //     },
      
  //   ],
  // },
  {
    path: '',
    // canActivate: [AuthGuard],
    component: AppLayoutComponent,
    // data: { authGuardPipe: () => redirectUnauthorizedTo(['/auth']) },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path:'home',component:MainHeaderComponent },
      { path:'report',component:ReportComponent },
      
    ],
    
  },
  
];

