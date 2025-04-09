import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/auth.store';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {

  constructor(
    public dialogRef: MatDialogRef<AlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    @Inject(AuthStore) private authStore: AuthStore
  ) {
    console.log(data, 'data');
  }

  ngOnInit() {}

  cancel() {
    this.dialogRef.close(false);
  }

  yes() {
    this.dialogRef.close(true);
    this.authStore.signOut();
  }
}