import {Component} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatGridListModule} from '@angular/material/grid-list';

interface Transaction {
  item: string;
  cost: number;
}


@Component({
  selector: 'app-report',
  imports: [
    MatGridListModule,
    MatTableModule, 
    CurrencyPipe,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {

  displayedColumns: string[] = ['item', 'cost'];
  transactions: Transaction[] = [
    {item: 'Car', cost: 4},
    {item: 'Phone', cost: 5},
    {item: 'Motor', cost: 2},
    {item: 'Jewelry', cost: 4},
    {item: 'Others', cost: 25},
  ];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }

}
