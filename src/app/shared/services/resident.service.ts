import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResidenceChangeService {
  private residenceChangedSource = new Subject<void>();
  
  residenceChanged$ = this.residenceChangedSource.asObservable();

  notifyResidenceChanged() {
    this.residenceChangedSource.next();
  }
}
