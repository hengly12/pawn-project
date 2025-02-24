import { Component } from '@angular/core';
import {  RouterLink, RouterOutlet } from '@angular/router';
import { PawnFormComponent } from "./components/pawn-form/pawn-form.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pawn-project';
}
