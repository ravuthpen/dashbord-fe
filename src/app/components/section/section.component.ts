import { Component, signal } from '@angular/core';
import { PaginationComponent } from "../pagination/pagination.component";
import { UserListParams } from '../../models/user-list-params';
import { UserFormComponent } from "../user-form/user-form.component";

@Component({
  selector: 'app-section',
  imports: [
    PaginationComponent,
    UserFormComponent
],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css',
})
export class SectionComponent {

  filter = signal<UserListParams>({page:0, size: 4, priceMin: null, priceMax:null});

  onFilterChanged(f: UserListParams){
    this.filter.set(f);
  };
}
