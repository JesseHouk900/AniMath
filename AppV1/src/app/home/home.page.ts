import { Component } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  Value = '';
  theSide = '';

  constructor(private keyboard: Keyboard) { }

  SubmitClicked() {
    console.log('Submit Clicked');
  }

  OperationsClicked() {
    console.log('Operations Clicked');
  }

  // selectedSide(side) {
  //   if (side === 'RHS') {
  //     this.theSide = 'RHS';
  //     console.log('Right Side Clicked');
  //   } else {
  //     this.theSide = 'LHS';
  //     console.log('Left Side Clicked');
  //   }
  // }

  setInput(par1) {
    if (par1 === '/b') {
        this.Value = this.Value.slice(0, -1);
      } else {
        this.Value = this.Value.concat(par1);
        console.log('Button Pushed');
      }
    }

}
