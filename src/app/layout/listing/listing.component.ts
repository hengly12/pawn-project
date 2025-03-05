import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { PawnFormComponent } from '../../components/pawn-form/pawn-form.component';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { GetTimeAgoPipe } from "../../shared/pipes/customs.pipe";
import { DatePipe } from '@angular/common';

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
    PawnFormComponent,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    GetTimeAgoPipe,
    DatePipe
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
  data = signal<any>(null);

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
        let statusKey = null;
        if(paramKey == 'active'){
          statusKey = 1;
        }else{
          statusKey = -2;
        }
        this.routeUnSubscribe.set(
          this.store.fetchListing(statusKey).subscribe( res =>{
            console.log(res, 'data')
            this.data.set(res);
          })
        )
      
      })
    )
  }

}
