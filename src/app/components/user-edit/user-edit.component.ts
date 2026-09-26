import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerProfile } from '../../models/customerProfile';
import { UserService } from '../../services/user.service';
import { UserFormComponent } from "../user-form/user-form.component";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-edit',
  imports: [UserFormComponent],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar)

  // strictly typed signal
  customerProfile = signal<CustomerProfile | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load(id);
    }
  }

  private load(id: string) {
    this.userService.getById(id).subscribe({
      next: profile => {
        this.customerProfile.set(profile);
      },
      error: err => {
        console.error('Load failed', err);
      }
    });
  }

  onUpdate(evt: { id: string; body: CustomerProfile }) {
    this.userService.update(evt.id, evt.body).subscribe({
      next: () => {
        // show success toast
        this.snackBar.open('User update successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/users', evt.id]);
      },
      error: err => {
        console.error('Update failed', err);
        // show error toast
        this.snackBar.open('Failed to update user', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }
}