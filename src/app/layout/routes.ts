import { Routes } from "@angular/router";
import { PawnFormComponent } from "../components/pawn-form/pawn-form.component";
import { ReportRouterComponent } from "../components/report-router/report-router.component";
import { ReportComponent } from "../components/report/report.component";
import { ExpiredCustomerComponent } from "../expired-customer/expired-customer.component";
import { LayoutWrapperComponent } from "./layout-wrapper/layout-wrapper.component";
import { ListingComponent } from "./listing/listing.component";

export const routes: Routes = [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: LayoutWrapperComponent,
        children: [
          {
            path: '',
            redirectTo: 'active/listing',
            pathMatch: 'full',
          },
          {
            path: ':statusKey/listing',
            component: ListingComponent,
            children: [
              {
                path: 'create-form/:id',
                component: PawnFormComponent,
              },
            ],
          },

          {
            path: 'report',
            component: ReportRouterComponent,
            children: [
              { path: 'data-customer', component: ReportComponent },

              {
                path: 'data-expired-customer',
                component: ExpiredCustomerComponent,
              },
            ],
          },
        ],
      },
    ]