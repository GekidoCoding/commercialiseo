import {Component, OnInit} from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  template: ''
})
export abstract class BaseCrudComponent<T> implements OnInit {
  items: T[] = [];
  showSearchForm = false;
  currentPage = 1;
  itemsPerPage = 5;
  showConfirmation = false;
  showError = false;
  confirmationMessage = '';
  errorMessage = '';
  sortConfig: { column: keyof T, order: 'asc' | 'desc' } = { column: 'id' as keyof T, order: 'asc' };
  isSelectionMode = false;
  selectedIds: { [key: string]: boolean } = {};
  selectAll = false;
  searchSubject = new Subject<void>();
  isLoading = true;

  public newItem: Partial<T> = {};
  public selectedItem: T | any ;
  public searchCriteria: Partial<T> = {};
  ngOnInit() {
    this.loadData();
  }

  protected constructor(public modalService: NgbModal) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applySearch();
    });
  }


  abstract loadData(): void;
  abstract addItem(): void;
  abstract confirmUpdate(modal: any): void;
  abstract openUpdateModal(content: any, item: T): void;
  abstract initializeNewItem(): Partial<T>;
  abstract resetSearchCriteria(): Partial<T>;

  get selectedCount(): number {
    return Object.keys(this.selectedIds).length;
  }

  applySearchDebounced() {
    this.searchSubject.next();
  }

  sortByColumn(column: keyof T) {
    if (this.sortConfig.column === column) {
      this.sortConfig.order = this.sortConfig.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig.column = column;
      this.sortConfig.order = 'asc';
    }
    this.currentPage = 1;
  }

  protected applyFilters(items: T[]): T[] {
    return items; // Override in child classes for model-specific filtering
  }

  get filteredItems() {
    let result = [...this.items];

    // Apply model-specific filters
    result = this.applyFilters(result);

    // Apply sorting
    if (this.sortConfig.column) {
      result.sort((a, b) => {
        let valueA: any = a[this.sortConfig.column];
        let valueB: any = b[this.sortConfig.column];

        // Handle date columns if overridden
        if (this.isDateColumn(this.sortConfig.column)) {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        } else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return this.sortConfig.order === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortConfig.order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return result.slice(start, end);
  }

  get totalItems() {
    return this.applyFilters([...this.items]).length;
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.showConfirmation = false;
    }
  }

  toggleSearchForm() {
    this.showSearchForm = !this.showSearchForm;
    if (!this.showSearchForm) {
      this.searchCriteria = this.resetSearchCriteria();
      this.applySearch();
    }
  }

  applySearch() {
    this.currentPage = 1;
    this.showConfirmation = false;
  }

  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    this.selectedIds = {};
    this.selectAll = false;
  }

  toggleSelectAll() {
    this.selectedIds = {};
    if (!this.selectAll) {
      return;
    }
    this.filteredItems.forEach(item => {
      this.selectedIds[(item as any).id] = true;
    });
  }

  updateSelectAll() {
    this.selectAll = this.filteredItems.every(item => this.selectedIds[(item as any).id]);
  }

  openAddModal(content: any) {
    this.newItem = this.initializeNewItem();
    const options: NgbModalOptions = { size: 'lg', centered: true, backdrop: 'static' };
    this.modalService.open(content, options);
  }

  openDeleteModal(content: any) {
    if (Object.keys(this.selectedIds).length === 0) return;
    const options: NgbModalOptions = { centered: true, backdrop: 'static' };
    this.modalService.open(content, options);
  }

  protected showSuccessMessage(message: string) {
    this.confirmationMessage = message;
    this.showConfirmation = true;
    setTimeout(() => {
      this.closeToast();
    }, 3000);
  }

  protected showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    setTimeout(() => {
      this.closeToast();
    }, 3000);
  }

  closeToast() {
    this.showConfirmation = false;
    this.showError = false;
    this.confirmationMessage = '';
    this.errorMessage = '';
  }
  protected isDateColumn(column: keyof T): boolean {
    return false; // Override in child classes for date-specific columns
  }

  protected formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

}
