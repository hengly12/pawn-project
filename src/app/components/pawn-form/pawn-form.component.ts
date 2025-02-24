import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pawn-form',
  standalone: true,
  imports: [ReactiveFormsModule,
            NgIf,
  ],
  templateUrl: './pawn-form.component.html',
  styleUrl: './pawn-form.component.scss'
})
export class PawnFormComponent {
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