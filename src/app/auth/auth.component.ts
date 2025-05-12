import { AuthStore } from './auth.store';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',

})
export class AuthComponent {
  constructor(private auth: AuthStore) { }

  ngOnInit(): void {
    this.auth.loading.set(true)
    // Initialize any necessary data or state here
    this.auth.canActive();
  }
}
