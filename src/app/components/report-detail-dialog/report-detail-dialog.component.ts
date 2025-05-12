import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DatePipe, CurrencyPipe, CommonModule, NgIf,} from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxPrintModule } from 'ngx-print';

@Component({
  selector: 'app-report-detail-dialog',
  templateUrl: './report-detail-dialog.component.html',
  styleUrls: ['./report-detail-dialog.component.scss'],
  imports: [
    MatDialogModule, 
    DatePipe, 
    CurrencyPipe, 
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIcon,
    MatAutocompleteModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    NgxPrintModule,

  ],
  standalone: true,
})
export class ReportDetailDialogComponent {
  image: boolean = false;
  preview: string = '';
  selectedFiles: FileList | null = null;
  currentFile?: File;
  upload: boolean = true;
  imagePreview: string[] = [];
  safeImageUrl: SafeUrl | null = null;
  dragOver: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    console.log('Dialog Data:', data);
 
    if (data.image) {
      console.log('Data Image URL:', data.image);
      this.safeImageUrl = this.sanitizeImageUrl(data.image);
      this.image = true;
      this.upload = false;
    }
  }
 
  getGenderText(gender: any): string {
    if (gender && gender.text) {
      return gender.text;
    }
    return '';
  }


  getPawnTypeText(pawnType: any): string {
    if (pawnType && pawnType.text) {
      return pawnType.text;
    }
    return '';
  }

  onFileDrop(event: any): void {
    event.preventDefault();
    this.selectedFiles = event?.dataTransfer?.files;
    this.selectFile({ target: { files: this.selectedFiles } });
    this.dragOver = false;
  }

  onDragOver(event: any): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: any): void {
    event.preventDefault();
    this.dragOver = false;
  }

  closeImage() {
    this.image = false;
    this.preview = '';
    this.selectedFiles = null;
    this.upload = true;
    this.safeImageUrl = null;
  }

  selectFile(event: any): void {
    this.preview = '';
    this.selectedFiles = event?.target?.files;
    this.safeImageUrl = null;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles[0];

      if (file) {
        this.currentFile = file;

        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.preview = e.target.result;
          this.safeImageUrl = this.sanitizeImageUrl(this.preview);
          if (this.preview != '') {
            this.upload = false;
            this.image = true;
          }
          this.cdr.detectChanges();
        };

        reader.readAsDataURL(this.currentFile);
      }
    }
  }

  onImageUpload(event: any) {
    const files = event.target.files;
    if (files && files.length) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  printReportDataDetail() {
    window.print();
  }
}