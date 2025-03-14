import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, ActivatedRoute, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GetTimeAgoPipe } from "../../shared/pipes/customs.pipe";
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { ListingComponent } from '../../layout/listing/listing.component';

@Component({
  selector: 'app-customer-info',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatButtonModule,
    MatTabsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    GetTimeAgoPipe,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.scss'
})
export class CustomerInfoComponent {

  routeUnSubscribe = signal<any>(Subscription);
    data = signal<any>(null);
    param = signal<any>(null);

    constructor(
    private dialog: MatDialog,
    public auth: AuthStore,
    private readonly route: ActivatedRoute,
    private readonly store: PawnStore,

    public dialogRef: MatDialogRef<ListingComponent>,
      @Inject(MAT_DIALOG_DATA) public info_customer: any,
    ){

      
      console.log(info_customer, 'data')
    }
  
    ngOnInit(){
  
    }

    close(){
      this.dialogRef.close(true)
    }
  }
  
