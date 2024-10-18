import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TreeSelectionService {
  private selectedTreeSubject = new BehaviorSubject<any>(null);
  selectedTree = this.selectedTreeSubject.asObservable();

  constructor() { }

  setSelectedTree(tree: any) {
    this.selectedTreeSubject.next(tree);
  }
}
