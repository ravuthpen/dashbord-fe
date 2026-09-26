
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerProfile } from '../../models/customerProfile';
import { UserService } from '../../services/user.service';
import { UserFormComponent } from "../user-form/user-form.component";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-create',
  imports: [UserFormComponent],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css'
})
export class UserCreateComponent {
private userService = inject(UserService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar)

  onCreate(body: CustomerProfile) {
    
    this.userService.create(body).subscribe({
      next: created => {
        // show success toast
        this.snackBar.open('User created successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

        // navigate to detail page
        //this.router.navigate(['/Users', created.id]); /* /Users/id */
      },
      error: err => {
        console.error('Create failed', err);
        // error toast
        this.snackBar.open('Failed to create user', 'Close', {
          duration: 4000,
          panelClass: ['snack-error'], // optional custom style
          horizontalPosition: 'center',
          verticalPosition: 'top'
        })
      }
    });
    
  }
}