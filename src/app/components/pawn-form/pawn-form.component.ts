import { serverTimestamp } from '@angular/fire/firestore';
import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter} from '@angular/material/core';
import { MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { GENDER_DATA } from '../../shared/dummy/config';
import { DataService } from '../../shared/services/data.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-pawn-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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

  constructor(
    private ds: DataService
  ){}

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  pawnForm = new FormGroup({
    fullName: new FormControl(''),
    gender: new FormControl(''),
    phone: new FormControl(''),
    idCard: new FormControl(''),
    address: new FormControl(''),
    pawnItem: new FormControl(''),
    description: new FormControl(''),
    dateCreated: new FormControl(''),
    expireDate: new FormControl(''),
    image: new FormControl('')
  });

  displayGender = (item: any) => {
    return item?.text;
  };

  imagePreview: string | ArrayBuffer | null = null;

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    console.log(this.pawnForm.value);
  }
  
}