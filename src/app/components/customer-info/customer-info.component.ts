import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';




@Component({
  selector: 'app-listing',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatButtonModule,
    MatTabsModule,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatDialogModule, 
    MatButtonModule,
],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.scss'
})
export class CustomerInfoComponent {

  routeUnSubscribe = signal<any>(Subscription);
  data = signal<any>(null);
  param = signal<any>('active');
  

  

  constructor(
    public dialogRef: MatDialogRef<CustomerInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public info_customer: any,
    public auth: AuthStore,
    private readonly route: ActivatedRoute,
    private readonly store: PawnStore,

  ){
    console.log(info_customer, 'info')
  }

  ngOnInit(){
    this.routeUnSubscribe.set(
      this.store.fetchInfoListing().subscribe( (res) =>{
        this.data.set(res)
      })
    )

  }

  ngOnDestroy(){
    this.routeUnSubscribe().unsubscribe()
  }

  close(){
    this.dialogRef.close(true)
  }
}
  
