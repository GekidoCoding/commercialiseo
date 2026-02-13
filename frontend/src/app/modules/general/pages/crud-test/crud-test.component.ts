import { Component } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import {BaseCrudComponent} from "../../components/base/base-crud.component";

interface Item {
  id: string;
  date: string; // Format: YYYY-MM-DD
  datetime: string; // Format: YYYY-MM-DD HH:mm:ss
  matricule: string;
  name: string;
  prestation: string;
}

@Component({
  selector: 'app-crud-test',
  templateUrl: './crud-test.component.html',
  styleUrls: ['../../components/base/base-crud.component.scss'],
})
export class CrudTestComponent extends BaseCrudComponent<Item> {
  constructor(modalService: NgbModal) {
    super(modalService);
    this.items = [
      { id: '12346789', date: '2024-12-12', datetime: '2024-12-12 14:30:00', matricule: '78945', name: 'Harry Potter', prestation: 'Consultation magique' },
      { id: '12345678', date: '2024-11-10', datetime: '2024-11-10 09:15:00', matricule: '78946', name: 'Hermione Granger', prestation: 'Analyse de sortilèges' },
      { id: '12345679', date: '2024-10-05', datetime: '2024-10-05 16:45:00', matricule: '78947', name: 'Ron Weasley', prestation: 'Entraînement de Quidditch' },
      { id: '12345680', date: '2024-09-20', datetime: '2024-09-20 11:00:00', matricule: '78948', name: 'Albus Dumbledore', prestation: 'Conseil stratégique' },
      { id: '12345681', date: '2024-08-15', datetime: '2024-08-15 13:20:00', matricule: '78949', name: 'Severus Snape', prestation: 'Préparation de potions' }
    ];
  }

  loadData() {
    this.applySearch();
  }

  protected applyFilters(items: Item[]): Item[] {
    let result = [...items];
    if (this.searchCriteria.id) result = result.filter(item => item.id.includes(this.searchCriteria.id!));
    if (this.searchCriteria.date) result = result.filter(item => item.date.includes(this.searchCriteria.date!));
    if (this.searchCriteria.datetime) result = result.filter(item => item.datetime.includes(this.searchCriteria.datetime!));
    if (this.searchCriteria.matricule) result = result.filter(item => item.matricule.includes(this.searchCriteria.matricule!));
    if (this.searchCriteria.name) result = result.filter(item => item.name.toLowerCase().includes(this.searchCriteria.name!.toLowerCase()));
    if (this.searchCriteria.prestation) result = result.filter(item => item.prestation.toLowerCase().includes(this.searchCriteria.prestation!.toLowerCase()));
    return result;
  }

  protected isDateColumn(column: keyof Item): boolean {
    return column === 'date' || column === 'datetime';
  }

  initializeNewItem(): Partial<Item> {
    return { id: '', date: '', datetime: '', matricule: '', name: '', prestation: '' };
  }

  resetSearchCriteria(): Partial<Item> {
    return { id: '', date: '', datetime: '', matricule: '', name: '', prestation: '' };
  }

  addItem() {
    this.items.push({ ...this.newItem } as Item);
    this.applySearch();
    this.showSuccessMessage('Ajout réussi !');
  }

  confirmUpdate(modal: any) {
    const index = this.items.findIndex(item => item.id === this.selectedItem!.id);
    if (index !== -1) {
      this.items[index] = { ...this.selectedItem! };
    }
    modal.close();
    this.showSuccessMessage('Modification réussie !');
    this.applySearch();
  }

  openUpdateModal(content: any, item: Item) {
    this.selectedItem = { ...item };
    const options: NgbModalOptions = { size: 'lg', centered: true, backdrop: 'static' };
    this.modalService.open(content, options);
  }

  deleteSelectedItems(modal: any) {
    this.items = this.items.filter(item => !this.selectedIds[item.id]);
    this.selectedIds = {};
    this.selectAll = false;
    this.isSelectionMode = false;
    modal.close();
    this.showSuccessMessage('Suppression réussie !');
    this.applySearch();
  }
}

