import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { asapScheduler, debounceTime, distinctUntilChanged, first, fromEvent, Observable } from 'rxjs';
import { UserService } from './user.service';
import { ToastrService } from 'ngx-toastr';

import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit  {
  /*
  https://django.fun/ru/articles/tutorials/angular-i-django-autentifikaciya-s-pomoshyu-jwt/
  */

  @Output() subscribedFeeIds: EventEmitter<any> = new EventEmitter<any>(); 

  private MY_API_KEY = '3129835b6fc88da2c371232503e5aa88'
  private MY_EMAIL = 'dad@gmail.com'
  private MY_PASSWORD = 'dad'
  private API_DOMAIN:string = 'http://127.0.0.1/api' 

  public user: any;
  public userForm: FormGroup;
  
  searched_city_response: any[] = [];
  searched_department_response: any[] = [];

  showSeachedCityUl:boolean = false;
  showSeachedDepartmentOptions: boolean = false;

  loginToken: string = null;

  get httpOptions(){
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.loginToken,
      }),
    }
  }

  get currentUser(){
    return localStorage.getItem('currentUser')
  }
  get currentUserToken(){
    return JSON.parse(localStorage.getItem('currentUser'))['access']
  }
  get currentUserRefreshToken(){
    return JSON.parse(localStorage.getItem('currentUser'))['refresh']
  }
  set currentUser(userDict:string){
    if(userDict !== null){
      localStorage.setItem('currentUser', userDict);
      this.loginToken = JSON.parse(userDict)['access'];
    }
    else{
      localStorage.removeItem('currentUser');
      this.loginToken = null;
    }
  }


  get toastrOptions(){
    // https://www.npmjs.com/package/ngx-toastr
    return {
      timeOut: 2000,
    }
  }
  

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService // for notifications
  ) {
  }
  ngOnInit(){
    if(this.currentUser){
      this.loginToken = this.currentUserToken;
      this.getUserDataFromServer();
      this.showUserDataForm();
    }
    else{
      this.showLoginForm();
    }
  }
  ngAfterViewInit() {}



  // ------------------------------------- LOGIN FORM --------------------------------------------------------------

  loginForm: FormGroup;
  showLoginForm(){
    this.loginForm = this.formBuilder.group({
      email: '',
      password: '',
    });
  }

  get getLoginForm(){
    return this.loginForm.controls;
  }

  loginFormSubmit(){
    this.userService.login({'email': this.getLoginForm['email'].value, 'password': this.getLoginForm['password'].value})  //.pipe(first())
    .subscribe((user:any)=>{
      if(user && user.access){
        this.currentUser = JSON.stringify(user);
        this.loginToken = this.currentUserToken;
        this.getUserDataFromServer();
        this.showUserDataForm();
      }
    },
    error => {
      console.log('error');
      this.toastr.error('Pass in right data', 'Wrong data!' , this.toastrOptions);
    }
    );
  }

  // ------------------------------------- Account FORM --------------------------------------------------------------

  async getUserDataFromServer(){
    var np_api_key:any = jwt_decode(this.currentUserToken);
    np_api_key = np_api_key['npToken'];
    
    this.http.get(this.API_DOMAIN + '/users/' + np_api_key + '/', this.httpOptions)
    .subscribe(
      (data:any) => {
        this.fillUserFormWithData(data);
      },
      error => {
        if(error.status === 401){ // Means Unauthorized - access token invalid
          this.userService.refreshToken(this.currentUserRefreshToken).subscribe(data => {
            JSON.stringify(
              {
                'refresh':this.currentUserRefreshToken,
                'access':data,
              }
            )
          })
          this.getUserDataFromServer()
        }
      }
    )
  }

  showUserDataForm(){
    this.userForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      npToken: '',
      phoneNumber: '',

      sender:'',
      senderRef:'',

      senderDepartmentCity:'',
      senderDepartmentCityRef: '',
      senderDepartmentAddress: '',
      senderDepartmentAddressRef:'',

      searched_city_response:'',
    })
  }



  userFormSubmit(){
    this.http.put(this.API_DOMAIN + '/users/' + this.userForm.get('npToken').value + '/', JSON.stringify(this.userForm.value), this.httpOptions )
    .subscribe(
      (data:any) => {
      },
      error => {
      }
    )
  }


  




  searchDepartmentAddress(value:string, what_search:string='senderDepartmentCity'){
    var data = {
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: value,
        Limit: 50
      },
      apiKey: this.userForm.get('npToken').value,
    }

    this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
    .subscribe((response:any) =>{
      this.fill_in_searching_results(response, what_search);
    }) 
  }
  


  fill_in_searching_results(response:any, search_type:string='senderDepartmentCity'){
    if(response.success !== false && response.data[0] !== undefined && response.data[0].TotalCount !== 0){
      var searching:any;
      
      // ----------------------------------- Sender ------------------------------------------
      if(search_type === 'senderDepartmentCity'){
        searching = response.data[0].Addresses;
        this.searched_city_response = [];

        for(var i in searching){
          this.searched_city_response.push(
            {
              full_name:searching[i].Present,
              short_name:searching[i].MainDescription,
              ref:searching[i].Ref,
            }
          )
        }

        this.showSeachedCityUl = true;
      }
      else if(search_type === 'senderWarehouse'){
        searching = response.data;
        this.searched_department_response = [];

        for(var i in searching){
          this.searched_department_response.push(
            {
              value: searching[i].Ref,
              name: '№ ' + searching[i].Number + ' - ' + searching[i].ShortAddress,
            }
          )
        }
        

        this.userForm.get('senderDepartmentAddress').setValue(searching[0].Description);
        this.userForm.get('senderDepartmentAddressRef').setValue(searching[0].Ref);
        this.showSeachedDepartmentOptions = true;
      }      
    }
    else{
      // this.searched_city_response = [];
      // this.searched_delivery_city_response = [];
    }
  }

  loadSenderPostDepartments(full_city:string, short_city:string, ref:string){
    var what_warehouse = '';
    
    this.userForm.get('senderDepartmentCity').setValue(full_city);
    this.userForm.get('senderDepartmentCityRef').setValue(ref);
    this.showSeachedCityUl = false;
    what_warehouse = 'senderWarehouse';

    

    var data = {
      modelName: 'Address',
      calledMethod: 'getWarehouses',
      methodProperties: {
        CityName: short_city,
        CategoryOfWarehouse: '',
      },
      apiKey: this.userForm.get('npToken').value
    }
    this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
    .subscribe((response:any) =>{
      this.fill_in_searching_results(response, what_warehouse);
    }) 
  }
  loadDepartmentsWhenPageLoads(city:string){
    // We have to pick short city name, so we make 2 api calls
    var data = {
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: city,
        Limit: 50
      },
      apiKey: this.userForm.get('npToken').value,
    }

    this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
    .subscribe((response:any) =>{
      var data = {
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityName: response['data'][0]['Addresses'][0]['MainDescription'],
          CategoryOfWarehouse: '',
        },
        apiKey: this.userForm.get('npToken').value
      }
      this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
      .subscribe((response:any) =>{
        var searching = response.data;
        // then we push other addresses
        for(var i in searching){
          this.searched_department_response.push(
            {
              value: searching[i].Ref,
              name: '№ ' + searching[i].Number + ' - ' + searching[i].ShortAddress,
            }
          )
        }
        
        this.showSeachedDepartmentOptions = true;
        if(this.userForm.get('senderDepartmentAddressRef').value === null){
          this.userForm.get('senderDepartmentAddress').setValue('№ ' + searching[0].Number + ' - ' + searching[0].ShortAddress)
          this.userForm.get('senderDepartmentAddressRef').setValue(searching[i].Ref)          
        }
      }) 
    })     
  }


  changeDepartmentOption(optionValue:any){
    var value = this.searched_department_response[Number(optionValue)]['value']
    var name = this.searched_department_response[Number(optionValue)]['name']
    
    this.userForm.patchValue({'senderDepartmentAddress':name, 'senderDepartmentAddressRef':value})
  }




  





  fillUserFormWithData(data:any){
    this.userForm.get('firstName').setValue(data['firstName'])
    this.userForm.get('lastName').setValue(data['lastName'])
    this.userForm.get('npToken').setValue(data['npToken'])
    this.userForm.get('phoneNumber').setValue(data['phoneNumber'])
    this.userForm.get('sender').setValue(data['sender'])
    this.userForm.get('senderRef').setValue(data['senderRef'])
    this.userForm.get('senderDepartmentCity').setValue(data['senderDepartmentCity'])
    this.userForm.get('senderDepartmentCityRef').setValue(data['senderDepartmentCityRef'])
    this.userForm.get('senderDepartmentAddress').setValue(data['senderDepartmentAddress'])
    this.userForm.get('senderDepartmentAddressRef').setValue(data['senderDepartmentAddressRef'])
    
    // we fill in addresses
    if(this.userForm.get('senderDepartmentAddressRef').value !== null){
      this.searched_department_response.push(
        {
          value: this.userForm.get('senderDepartmentAddressRef').value,
          name: this.userForm.get('senderDepartmentAddress').value,
        }
      )
    }
    // then we fill in our Sender
    if(this.userForm.get('sender').value === null || this.userForm.get('senderRef').value === null){
      this.getSender()
    }

    
    this.userService.changeSenderParam({
      'Sender': data['sender'],
      'ContactSender': data['senderRef'],
      'SendersPhone': data['phoneNumber'],
      'CitySender': data['senderDepartmentCityRef'],
      'SenderAddress': data['senderDepartmentAddressRef'],
    })

    this.loadDepartmentsWhenPageLoads(data['senderDepartmentCity']);
  }



  
  

  SenderDepartmentCliked:boolean=false;
  subscribeToApiByClickSenderDepartment(){
    if(this.SenderDepartmentCliked){return;}

    var searchSenderDepartmentCity$:Observable<Event> = fromEvent<Event>(document.getElementById('senderDepartmentCity')!, 'input');
    this.SenderDepartmentCliked = true;

    searchSenderDepartmentCity$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe({
      next: value => {
        var target = (value.target as HTMLInputElement);
        this.searchDepartmentAddress(target.value)
      },
    })

  }



  getSender(){
    // https://developers.novaposhta.ua/view/model/a28f4b04-8512-11ec-8ced-005056b2dbe1/method/a37a06df-8512-11ec-8ced-005056b2dbe1

    // FIRSTLY WE GET SENDER
    var data = {
      "apiKey": this.userForm.get('npToken').value,
      "modelName": "Counterparty",
      "calledMethod": "getCounterparties",
      "methodProperties": {
        "CounterpartyProperty" : "Sender",
        "Page" : "1"
      }
    } 


    this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
    .subscribe((response:any) =>{
      // THEN WE GET SENDER REF
      this.userForm.get('sender').setValue(response['data'][0]['Ref'])
      
      var data1 = {
        "apiKey": this.userForm.get('npToken').value,
        "modelName": "Counterparty",
        "calledMethod": "getCounterpartyContactPersons",
        "methodProperties": {
          "Ref" : this.userForm.get('sender').value,
          "Page" : "1"
        }
      }

      this.http.post('https://api.novaposhta.ua/v2.0/json/', data1)
      .subscribe((response:any) =>{
        this.userForm.get('senderRef').setValue(response['data'][0]['Ref'])

        // Save results to server
        document.getElementById('accountSubmitButton').click();
      }) 

    }) 

    

    
  }
}



