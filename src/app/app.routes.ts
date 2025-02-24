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
import { PawnFormComponent } from './components/pawn-form/pawn-form.component';
import { register } from 'module';
import { RegisterFormComponent } from './auth/register-form/register-form.component';


export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    data: { authGuardPipe: () => redirectLoggedInTo(['/']) },
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterFormComponent,
      }
      
    ],
  },
  {
    path: '',
    // canActivate: [AuthGuard],
    component: AppLayoutComponent,
    // data: { authGuardPipe: () => redirectUnauthorizedTo(['/auth']) },
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path:'home',component:LayoutWrapperComponent,children:[
        { path: 'create-form', component:PawnFormComponent},
      ] },
      // {path:'home',redirectTo:'home/create-form'}
      { path:'report',component:ReportComponent },
      
    ],
    
  },
  
];

