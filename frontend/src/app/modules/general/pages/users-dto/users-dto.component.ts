import { Component } from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { UsersDto } from '../../model/users/dto/users.dto';
import { UsersDtoService } from '../../services/users/dto/users.dto.service';
import {BaseCrudComponent} from "../../components/base/base-crud.component";

@Component({
  selector: 'app-users',
  templateUrl: './users-dto.component.html',
  styleUrls: ['../../components/base/base-crud.component.scss']
})
export class UsersDtoComponent extends BaseCrudComponent<UsersDto> {
  constructor(modalService: NgbModal, private usersService: UsersDtoService) {
    super(modalService);
  }

  ngOnInit() {
    this.loadData();
    setTimeout(()=>{
      this.isLoading = false;
    } , 3000);
  }

  loadData() {
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.items = users;
        this.applySearch();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showErrorMessage('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  protected applyFilters(items: UsersDto[]): UsersDto[] {
    let result = [...items];
    if (this.searchCriteria.id) result = result.filter(item => item.id.toString().includes(this.searchCriteria.id!.toString()));
    if (this.searchCriteria.name) result = result.filter(item => item.name.toLowerCase().includes(this.searchCriteria.name!.toLowerCase()));
    if (this.searchCriteria.date_exp) result = result.filter(item => this.formatDate(item.date_exp) === this.formatDate(this.searchCriteria.date_exp!));
    if (this.searchCriteria.birthday) result = result.filter(item => this.formatDate(item.birthday) === this.formatDate(this.searchCriteria.birthday!));
    return result;
  }

  protected isDateColumn(column: keyof UsersDto): boolean {
    return column === 'date_exp' || column === 'birthday';
  }

  initializeNewItem(): Partial<UsersDto> {
    return { name: '', date_exp: new Date(), birthday: new Date() };
  }

  resetSearchCriteria(): Partial<UsersDto> {
    return { id: undefined, name: '', date_exp: undefined, birthday: undefined };
  }

  addItem() {
    const user: UsersDto = new UsersDto();
    user.name = this.newItem.name!;
    user.date_exp = new Date(this.newItem.date_exp!);
    user.birthday = new Date(this.newItem.birthday!);

    this.usersService.create(user).subscribe({
      next: (createdUser) => {
        this.items.push(createdUser);
        this.applySearch();
        this.showSuccessMessage('Utilisateur ajouté avec succès !');
      },
      error: (error) => {
        console.error('Error adding user:', error);
        this.showErrorMessage('Erreur lors de l\'ajout de l\'utilisateur');
      }
    });
  }

  confirmUpdate(modal: any) {
    const user: UsersDto = new UsersDto();
    user.id = this.selectedItem!.id;
    user.name = this.selectedItem!.name;
    user.date_exp = new Date(this.selectedItem!.date_exp);
    user.birthday = new Date(this.selectedItem!.birthday);

    this.usersService.update(this.selectedItem!.id, user).subscribe({
      next: (updatedUser) => {
        const index = this.items.findIndex(item => item.id === updatedUser.id);
        if (index !== -1) {
          this.items[index] = updatedUser;
        }
        modal.close();
        this.showSuccessMessage('Modification réussie !');
        this.applySearch();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.showErrorMessage('Erreur lors de la modification de l\'utilisateur');
      }
    });
  }

  openUpdateModal(content: any, item: UsersDto) {
    this.selectedItem = { ...item, date_exp: new Date(item.date_exp), birthday: new Date(item.birthday) };
    const options: NgbModalOptions = { size: 'lg', centered: true, backdrop: 'static' };
    this.modalService.open(content, options);
  }

  deleteSelectedItems(modal: any) {
    const deleteObservables = Object.keys(this.selectedIds).map(id =>
      this.usersService.delete(Number(id))
    );

    Promise.all(deleteObservables.map(obs => obs.toPromise())).then(() => {
      this.items = this.items.filter(item => !this.selectedIds[item.id]);
      this.selectedIds = {};
      this.selectAll = false;
      this.isSelectionMode = false;
      modal.close();
      this.showSuccessMessage('Suppression réussie !');
      this.applySearch();
    }).catch(error => {
      console.error('Error deleting users:', error);
      this.showErrorMessage('Erreur lors de la suppression des utilisateurs');
    });
  }
}

