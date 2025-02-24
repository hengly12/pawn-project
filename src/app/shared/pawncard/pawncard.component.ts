import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AlertComponent } from '../pages/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';

@Component({
  selector: 'app-pawncard',
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './pawncard.component.html',
  styleUrl: './pawncard.component.scss'
})
export class PawncardComponent {
@Input() childInput?:any[]

constructor(
    private dialog: MatDialog,
    private auth: AuthStore,
  ){}

  deleteCard(){
  const dialogRef = this.dialog.open(AlertComponent, {
    data: {
      title: 'Delete Info',
      description: 'Do You Want To Delete?'
    },
    width: '350px',
    role: 'dialog',
    panelClass: 'custom-dialog'
  })
}
}
