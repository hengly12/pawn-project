import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { GetTimeAgoPipe } from '../../shared/pipes/customs.pipe';

@Component({
  selector: 'app-customer-info',
  imports: [
  ],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.scss'
})
export class CustomerInfoComponent {

    constructor(
      public dialogRef: MatDialogRef<CustomerInfoComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ){
      console.log(data, 'data')
    }
  
    ngOnInit(){
  
    }

    close(){
      this.dialogRef.close(true)
    }
  }
