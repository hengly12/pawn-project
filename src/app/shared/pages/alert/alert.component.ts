import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/auth.store';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
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
    if(!data.modal_type){
      data['modal_type']="Default"
    }
  }

  ngOnInit() {}

  cancel() {
    this.dialogRef.close(false);
  }

  yes() {
    this.dialogRef.close(true);
  }
}