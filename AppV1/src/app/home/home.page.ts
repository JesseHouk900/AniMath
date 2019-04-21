import { Component } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  lValue = '';
  rValue = '';
  theSide = '';

  constructor(private keyboard: Keyboard) { }

  SubmitClicked() {
    console.log('Submit Clicked');
  }

  OperationsClicked() {
    console.log('Operations Clicked');
  }

  selectedSide(side) {
    if (side === 'RHS') {
      this.theSide = 'RHS';
      console.log('Right Side Clicked');
    } else {
      this.theSide = 'LHS';
      console.log('Left Side Clicked');
    }
  }

  setInput(par1, side) {
    if (side === 'LHS') {
      if (par1 === '/b') {
        this.lValue = this.lValue.slice(0, -1);
      } else {
        this.lValue = this.lValue.concat(par1);
        console.log('Button Pushed');
      }
    } else {
      if (par1 === '/b') {
        this.rValue = this.rValue.slice(0, -1);
      } else {
        this.rValue = this.rValue.concat(par1);
        console.log('Button Pushed');
      }
    }
  }

  showButton() {
    console.log('Swap Pushed');
  }

}
