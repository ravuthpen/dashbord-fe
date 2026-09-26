import { Routes } from '@angular/router';

import { SectionComponent } from './components/section/section.component';
import { UserCreateComponent } from './components/user-create/user-create.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { SettingsComponent } from './components/settings/settings.component';

import { LoginComponent } from './auth/components/login/login.component';


export const routes: Routes = [

  // Default page
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // Auth
  {
    path: 'login',
    component: LoginComponent
  },


  // User
  {
    path: 'users',
    component: UserListComponent
  },

  {
    path: 'properties',
    component: SectionComponent
  },

  {
    path: 'settings',
    component: SettingsComponent
  },

  {
    path: 'users/new',
    component: UserCreateComponent
  },

  {
    path: 'users/:id/edit',
    component: UserEditComponent
  },

  {
    path: 'users/:id',
    component: UserDetailComponent
  },


  // Not found
  {
    path: '**',
    redirectTo: 'login'
  }

];