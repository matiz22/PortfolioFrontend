import { Component } from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-circle',
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './loading-circle.html',
  styleUrl: './loading-circle.scss'
})
export class LoadingCircle {

}
