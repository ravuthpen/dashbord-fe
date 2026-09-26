import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MainComponent,
    LoadingComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {

  constructor(public router: Router) {}

  ngAfterViewInit(): void {
    // Remove the pre-bootstrap splash screen once Angular has rendered.
    setTimeout(() => {
      const splash = document.getElementById('app-splash');
      if (splash) {
        splash.classList.add('is-hidden');
        setTimeout(() => splash.remove(), 400);
      }
    }, 250);
  }

}