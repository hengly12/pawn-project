import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { GetTimeAgoPipe } from "../../shared/pipes/customs.pipe";
import { DatePipe, NgIf } from '@angular/common';
import { CustomerInfoComponent } from '../../components/customer-info/customer-info.component';


@Component({
  selector: 'app-listing',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatButtonModule,
    RouterOutlet,
    MatTabsModule,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    GetTimeAgoPipe,
    DatePipe,
    MatDialogModule, 
    MatButtonModule,
    
],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss'
})
export class ListingComponent {
  showFiller = false;
  tabs = signal<any>([
    { key: 'active', label: 'កំពុងបញ្ចាំ'},
    { key: 'inactive', label: 'បញ្ចប់ការបញ្ចាំ'}
  ]);

  routeUnSubscribe = signal<any>(Subscription);
  info_customer = signal<any>(null);
  data = signal<any>(null);
  param = signal<any>(null);
  today = new Date();

  constructor(
    private dialog: MatDialog,
    public auth: AuthStore,
    private readonly route: ActivatedRoute,
    private readonly store: PawnStore,
    
  ){}

  

  ngOnInit(){
    this.routeUnSubscribe.set(
      this.route.params.subscribe((param) => {
        let paramKey = param['statusKey'];
        console.log(paramKey)
        this.param.set(paramKey)
        let statusKey = null;
        if(paramKey == 'active'){
          statusKey = 1;
        }else{
          statusKey = -2;
        }
        this.routeUnSubscribe.set(
          this.store.fetchListing(statusKey).subscribe( res =>{
            console.log(res, 'info_customer')
            this.data.set(res);
          })
        )
      
      })
    )
  }

  ShowDialog(){
    const dialogRef = this.dialog.open(CustomerInfoComponent, {
      data: {
        title: 'ព័ត៌មានអតិថិជន',
        description: 'Select To Read More Information'
      },
      width: '800px',
      height:'900px',
      role: 'dialog',
      panelClass: 'custom-dialog'
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
