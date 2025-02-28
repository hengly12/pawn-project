import { serverTimestamp } from '@angular/fire/firestore';
import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter} from '@angular/material/core';
import { MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { GENDER_DATA, ITEM_DATA } from '../../shared/dummy/config';
import { DataService } from '../../shared/services/data.service';
import { sign } from 'crypto';

@Component({
  selector: 'app-pawn-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIcon,
    MatAutocompleteModule
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './pawn-form.component.html',
  styleUrl: './pawn-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PawnFormComponent {

  genders = signal<any>(GENDER_DATA);

  pawnItem = signal<any>(ITEM_DATA);
  seletedCar = signal<boolean>(false);
  seleted = signal<any>(null);
  text = signal<string>('')
  constructor(
    private ds: DataService, private fb: FormBuilder
  ){}
 

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  pawnForm = new FormGroup({
    fullName: new FormControl(''),
    gender: new FormControl(''),
    phoneNum: new FormControl(''),
    idCard: new FormControl(''),
    address: new FormControl(''),
    pawnItem: new FormControl(''),
    description: new FormControl(''),
    dateCreated: new FormControl(''),
    dateExpired: new FormControl(''),
    image: new FormControl(''),
    phone: new FormControl(''),
    car: new FormControl(''),
    phoneId: new FormControl(''),
    motor:new FormControl(''),
    jewelry: new FormControl(''),
    others: new FormControl(''),
    plateNum: new FormControl(''),
    brandName: new FormControl(''),
    pawnPrice: new FormControl(''),
    monthlyInterest: new FormControl(''),

  });

  ngOnInit(){
  }

  selectItem(item: any){
    this.seleted.set(item)
  }

  displayGender = (item: any) => {
    return item?.text;
  };

  displayItem = (item: any) => {
    return item?.text;
  };

  imagePreview: string[] = [];

  onImageUpload(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      // Loop through selected files
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.push(reader.result as string); // Add image preview to array
        };
        reader.readAsDataURL(file); // Read file as DataURL for preview
      }
    }
  }
  clearPreviews() {
    this.imagePreview = []; // Clear image previews
  }

  onSubmit() {
    console.log(this.pawnForm.value);
  }
  
  // ngOnInit(): void {
  //   this.pawnForm = this.fb.group({
  //     phone: ['', [Validators.pattern('^[0-9]*$')]] // Allows only numbers
  //   });
  // }

}