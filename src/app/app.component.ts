import { Component } from '@angular/core';
import {  RouterLink, RouterOutlet } from '@angular/router';
import { PawnFormComponent } from "./components/pawn-form/pawn-form.component";
import { AuthStore } from './auth/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor() {}
  title = 'pawn-project';

  ngOnInit(): void {
  }
}
