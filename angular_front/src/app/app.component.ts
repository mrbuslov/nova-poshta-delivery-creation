import { Component, OnInit } from '@angular/core';
import { UserService } from './account/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'my-app';


  constructor(
    private userService:UserService,
  ){

  }

  ngOnInit() {
  }

  ngAfterViewInit() { // when window loads 
    // this.accountComp.subscribeToPostApi()  
    // this.postComp.subscribeToPostApi()  
  }


}
