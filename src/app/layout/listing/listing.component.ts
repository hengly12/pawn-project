import { Component, signal, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { GetTimeAgoPipe } from "../../shared/pipes/customs.pipe";
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { CustomerInfoComponent } from '../../components/customer-info/customer-info.component';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-listing',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    RouterOutlet,
    MatTabsModule,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    GetTimeAgoPipe,
    DatePipe,
    MatDialogModule,
    CommonModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    
],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss'
})
export class ListingComponent implements OnInit {
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

  form!: FormGroup;
  showClearIcon = false;

  originalData = signal<any>([]);


      @ViewChild('searchInput') searchInput: ElementRef | undefined;

  constructor(
    private dialog: MatDialog,
    public auth: AuthStore,
    private readonly route: ActivatedRoute,
    private readonly store: PawnStore,
    private readonly fb: FormBuilder
    
  ){
   
  }

  
  ngOnInit(){
    this.form = this.fb.group({
      search: new FormControl('')
    });

    this.routeUnSubscribe.set(
      this.route.params.subscribe((param) => {
        let paramKey = param['statusKey'];
        this.param.set(paramKey)
        let statusKey = null;
        if(paramKey == 'active'){
          statusKey = 1;
        }else{
          statusKey = -2;
        }
        this.routeUnSubscribe.set(
          this.store.fetchListing(statusKey).subscribe( res =>{
            this.originalData.set(res);
            this.data.set(res);
          })
        )
      
      })
    )
    
    this.routeUnSubscribe.set(
      this.form.get('search')?.valueChanges.subscribe((value: string) => {
        if (value && value.trim() !== '') {
          this.routeUnSubscribe.set(
            this.route.params.subscribe((param) => {
              let paramKey = param['statusKey'];
              this.param.set(paramKey)
              let statusKey = null;
              if(paramKey == 'active'){
                statusKey = 1;
              }else{
                statusKey = -2;
              }
              this.searchListing(value, statusKey);
            })
          );
        } else {
          this.data.set(this.originalData());
          // console.log('Search cleared');
          this.routeUnSubscribe.set(
            this.route.params.subscribe((param) => {
              let paramKey = param['statusKey'];
              this.param.set(paramKey)
              let statusKey = null;
              if(paramKey == 'active'){
                statusKey = 1;
              }else{
                statusKey = -2;
              }
              this.routeUnSubscribe.set(
                this.store.fetchListing(statusKey).subscribe( res =>{
                  this.data.set(res);
                })
              )
            
            })
          )
        }
      })
    );
    
  }

  async searchListing(query: string, statusKey: any) {
    const data = await this.store.searchListing(query, statusKey);
    this.data.set(data)
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


  onInputChange() {

    this.showClearIcon = !!this.form.get('search')?.value; // Show "X" if input has value
  }

  clearInput() {
    this.form.get('search')?.setValue('');
    this.showClearIcon = false;
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }
  
}

