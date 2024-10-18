import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ReportService } from 'src/app/services/report.service';
import { Router } from '@angular/router';
import { TreeSelectionService } from 'src/app/services/tree-selection.service';

@Component({
  selector: 'app-tree-options-modal',
  templateUrl: './tree-options-modal.component.html',
  styleUrls: ['./tree-options-modal.component.scss'],
})
export class TreeOptionsModalComponent implements OnInit {
  constructor(
    private reportService: ReportService,
    private router: Router,
    private treeSelectionService: TreeSelectionService,
  ) {}

  @ViewChild(IonModal) modal?: IonModal;
  // @Output() treeSelected = new EventEmitter<any>();
  // treeSelected: EventEmitter<any> = new EventEmitter<any>()

  treeMatches: any[] = []
  treeSelection: any;

  ngOnInit() {}


  dismissModal() {
    this.modal?.dismiss();
  }

  async presentModal() {
    console.log('Presentado modal');
    this.modal?.present();
  }

  setTreeMatches(treeMatches: any) {
    console.log("Recieved and set tree matches:", treeMatches)
    this.treeMatches = treeMatches
  }

  selectTreeMatch(treeMatch: any) {
    // this.treeSelection = treeMatch
    this.treeSelectionService.setSelectedTree(treeMatch);
    // this.treeSelected.emit(treeMatch)
    console.log("Arbol seleccionado:", treeMatch)
    this.dismissModal()
  }
}
