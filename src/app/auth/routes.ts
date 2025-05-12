import { Routes } from "@angular/router";

export const  routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./register-form/register-form.component').then(m => m.RegisterFormComponent) },

];