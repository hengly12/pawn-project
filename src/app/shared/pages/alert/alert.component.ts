import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {

  constructor(
    public dialogRef: MatDialogRef<AlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){
    console.log(data, 'data')
  }

  ngOnInit(){

  }

  cancel(){
    this.dialogRef.close(false)
  }

  yes(){
    this.dialogRef.close(true)
  }
}
