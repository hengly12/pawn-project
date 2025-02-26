import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { PawnFormComponent } from '../../components/pawn-form/pawn-form.component';
import { Subscription } from 'rxjs';

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
  ],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss'
})
export class ListingComponent {
 testItems = signal<any[]>([
    {picture:"",id:"",name:"",phone:"",item:"",gender:""}
  ])
  showFiller = false;
  tabs = signal<any>([
    { key: 'active', label: 'កំពុងបញ្ចាំ'},
    { key: 'inactive', label: 'បញ្ចប់ការបញ្ចាំ'}
  ]);

  routeUnSubscribe = signal<any>(Subscription);

  constructor(
    private readonly route: ActivatedRoute
  ){}

  ngOnInit(){
    this.routeUnSubscribe.set(
      this.route.params.subscribe((param) => {
        console.log(param, 'param')
      })
    )
  }
}
