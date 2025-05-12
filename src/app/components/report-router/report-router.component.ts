import { CommonModule, } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {NgxPrintModule} from 'ngx-print';

@Component({
  selector: 'app-report-router',
  imports: [RouterOutlet,
    MatGridListModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatTabsModule,
    MatCardModule,
    MatDialogModule,
    CommonModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonModule,
    RouterModule,
    NgxPrintModule,
  ],
  templateUrl: './report-router.component.html',
  styleUrl: './report-router.component.scss'
})
export class ReportRouterComponent {

 router = inject(Router);
  
//  navigateToReport() {
//   this.router.navigate(['home/report/data-customer']);
// }

// navigateToExpired() {
//   this.router.navigate(['home/report/data-expired-customer']);
// }

}
