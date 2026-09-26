import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {


  countryCode = '+855';

  phoneNumber = '';

  // Default value
  userType = 'MEMBER';

  pin = '';

  errorMessage = '';

  isLoading = false;



  constructor(
    private authService: AuthService,
    private router: Router
  ) {}



  login(): void {


    if (!this.phoneNumber || !this.pin || !this.userType) {

      this.errorMessage =
        'Please fill all fields';

      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request = {

      countryCode: this.countryCode,

      phoneNumber: this.phoneNumber,

      userType: this.userType,

      pin: this.pin

    };


    console.log(
      'Login request:',
      request
    );



    this.authService.login(request)
      .subscribe({

        next: (response: any) => {

          this.isLoading = false;

          console.log(
            'Login success:',
            response
          );



          const token =
            response.accessToken ??
            response.access_token ??
            response.token;



          if (token) {


            this.authService.saveToken(token);


            this.router.navigate([
              '/users'
            ]);


          } else {


            this.errorMessage =
              'Token not found';


          }


        },


        error: (err: any) => {

          this.isLoading = false;

          console.error(
            'Login error:',
            err
          );


          this.errorMessage =
            'Invalid phone number or PIN';


        }


      });


  }


}