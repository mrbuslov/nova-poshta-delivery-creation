import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder,FormControl, FormArray, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, elementAt, fromEvent, map, merge, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PostService } from './post.service';
import { UserService } from '../account/user.service';

import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AccountComponent } from '../account/account.component';



const myNameValidator = (control: FormControl) => {
  const condition = !!control.value;
  if (!condition) {
    return {myNameValidator: 'does not match the condition'}
  }
  return null;
}

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  private MY_API_KEY = '3129835b6fc88da2c371232503e5aa88'
  loginToken: any;
  private API_DOMAIN:string = 'http://127.0.0.1/api' 

  postForm: FormGroup;

  searched_city_response: any[] = [];
  searched_department_response: any[] = [];
  searched_delivery_city_response: any[] = [];
  searched_delivery_department_response: any[] = [];

  subscribed_elements: string[] = [];

  get toastrOptions(){
    // https://www.npmjs.com/package/ngx-toastr
    return {
      timeOut: 2000,
    }
  }
  get httpOptions(){
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.loginToken,
      }),
    }
  }
  



  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private userService: UserService,
    private postService: PostService,
    private datepipe: DatePipe = new DatePipe('ru-RU'),
    private toastr: ToastrService // for notifications
  ) 
  { }

  ngOnInit(): void {
    this.getPostForm();
  }

  ngAfterViewInit(): void { // when window loads
    this.subscribeToPostApi();
    this.userService.loginTokenParam.subscribe(param=>{this.loginToken = param}); // get loginToken from account component
  }



  getPostForm(){
    this.postForm = this.formBuilder.group({
      postFormsArray: this.formBuilder.array([this.getPostFormGroup()]),
    })
  }
  get postFormsArray(){
    return this.postForm.get("postFormsArray") as FormArray;
  }


  
  removePostRecord(i:Required<number>){
    this.postFormsArray.removeAt(i);
  }

  async addDeliveryToForm(){
    this.postFormsArray.push(this.getPostFormGroup());
    await new Promise(f => setTimeout(f, 100)); // wait 0.1 sec until DOM displays content
    this.subscribeToPostApi();
  }



  payerTypeOptions:any[] = ['Отримувач','Відправник'];
  payerMethodOptions:any[] = ['Готівка','Безготівка'];
  cargoTypeOptions:any[] = ['Вантаж','Документи'];
  getPostFormGroup() {
    return this.formBuilder.group({
      recieverName:'',
      recieverSurname:'',
      recieverNumber:'',

      deliveryDepartmentCity:'',
      deliveryDepartmentCityRef:'',
      deliveryDepartmentAddress:'',
      deliveryDepartmentAddressRef:'',

      
      payerType: 'Recipient',
      paymentMethod: 'Cash',
      date: '',
      cargoType: 'Cargo',
      weight: '',
      seatsAmount: 1,
      description: '',
      assessedValue:['',  [Validators.required, Validators.min(10), Validators.max(1000000)]],
      width: null,
      height: null,
      length: null,
      totalVolume: 0,

      showDeliverySeachedCityUl:false,
      showDeliverySeachedDepartmentOptions:false,
    })
  }

  setPayerTypeOptions(event:any, option:string){
    var closestTableIndex = event.target.closest('table')?.getAttribute('ng-reflect-name');
    if(option==='Отримувач'){
      this.postFormsArray.at(closestTableIndex).patchValue({payerType:'Recipient'});
    }
    else if(option==='Відправник'){
      this.postFormsArray.at(closestTableIndex).patchValue({payerType:'Sender'});
    }
  }
  setPayerMethodOptions(event:any, option:string){
    var closestTableIndex = event.target.closest('table')?.getAttribute('ng-reflect-name');
    if(option==='Готівка'){
      this.postFormsArray.at(closestTableIndex).patchValue({payerMethod:'Cash'});
    }
    else if(option==='Безготівка'){
      this.postFormsArray.at(closestTableIndex).patchValue({payerMethod:'NonCash'});
    }    
  }
  setCargoTypeOptions(event:any, option:string){
    var closestTableIndex = event.target.closest('table')?.getAttribute('ng-reflect-name');
    if(option==='Вантаж'){
      this.postFormsArray.at(closestTableIndex).patchValue({cargoType:'Cargo'});
    }
    else if(option==='Документи'){
      this.postFormsArray.at(closestTableIndex).patchValue({cargoType:'Documents'});
    }    
  }


  changeTotalVolume(event:any, type:string){
    var closestTableIndex = event.target.closest('table')?.getAttribute('ng-reflect-name');
    var totalVolume = 1

    if(this.postFormsArray.at(closestTableIndex).get('width').value !== null){
      totalVolume *= this.postFormsArray.at(closestTableIndex).get('width').value
    }
    if(this.postFormsArray.at(closestTableIndex).get('length').value !== null){
      totalVolume *= this.postFormsArray.at(closestTableIndex).get('length').value      
    }
    if(this.postFormsArray.at(closestTableIndex).get('height').value !== null){
      totalVolume *= this.postFormsArray.at(closestTableIndex).get('height').value      
    }

    totalVolume /= 1000000
    this.postFormsArray.at(closestTableIndex).patchValue({totalVolume:totalVolume});
  }


  




  searchDepartmentAddress(value:string, what_search:string='deliveryDepartmentCity', elementArrayIndex:number=1){
    var data = {
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: value,
        Limit: 50
      },
      apiKey: this.MY_API_KEY,
    }

    this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
    .subscribe((response:any) =>{
      this.fill_in_searching_results(response, what_search, elementArrayIndex);
    }) 
  }
  


  fill_in_searching_results(response:any, search_type:string='deliveryDepartmentCity', elementArrayIndex:number){
    if(response.success !== false && response.data[0] !== undefined && response.data[0].TotalCount !== 0){
      var searching:any;
      
      // ---------------------------------- Receiver -----------------------------------------
      if(search_type === 'deliveryDepartmentCity'){
        searching = response.data[0].Addresses;
        this.searched_delivery_city_response = [];

        for(var i in searching){
          this.searched_delivery_city_response.push(
            {
              full_name:searching[i].Present,
              short_name:searching[i].MainDescription,
              ref:searching[i].Ref,
            }
          )
        }

        this.postFormsArray.at(elementArrayIndex).patchValue({showDeliverySeachedCityUl:true});
      }
      else if(search_type === 'receiverWarehouse'){
        searching = response.data;
        this.searched_delivery_department_response = [];

        for(var i in searching){
          this.searched_delivery_department_response.push(
            {
              value:searching[i].Ref,
              name: '№ ' + searching[i].Number + ' - ' + searching[i].ShortAddress,
            }
          )
        }
        
        this.postFormsArray.at(elementArrayIndex).patchValue({deliveryDepartmentAddress:searching[0].Description}); // Default value
        this.postFormsArray.at(elementArrayIndex).patchValue({deliveryDepartmentAddressRef:searching[0].Ref}); // Default value
        this.postFormsArray.at(elementArrayIndex).patchValue({showDeliverySeachedDepartmentOptions:true});
      }

      
    }
    else{
      // this.searched_city_response = [];
      // this.searched_delivery_city_response = [];
    }
  }

  loadSenderPostDepartments(event:any, full_city:string, short_city:string, ref:string){
    var closestTableIndex = event.target.closest('table')?.getAttribute('ng-reflect-name');
    var what_warehouse = '';

    this.postFormsArray.at(closestTableIndex).patchValue({deliveryDepartmentCity:full_city});
    this.postFormsArray.at(closestTableIndex).patchValue({deliveryDepartmentCityRef:ref});
    this.postFormsArray.at(closestTableIndex).patchValue({showDeliverySeachedCityUl:false});
    what_warehouse = 'receiverWarehouse';

    var data = {
      modelName: 'Address',
      calledMethod: 'getWarehouses',
      methodProperties: {
        CityName: short_city,
        CategoryOfWarehouse: '',
      },
      apiKey: this.MY_API_KEY
    }
    this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
    .subscribe((response:any) =>{
      this.fill_in_searching_results(response, what_warehouse, closestTableIndex);
    }) 
  }


  changeDepartmentOption(event:any, optionValue:any){
    var closestTableIndex = event.target.closest('table')?.getAttribute('ng-reflect-name');
    var value = this.searched_delivery_department_response[Number(optionValue)]['value']
    var name = this.searched_delivery_department_response[Number(optionValue)]['name']
    
    this.postFormsArray.at(closestTableIndex).patchValue({'deliveryDepartmentAddress':name, 'deliveryDepartmentAddressRef':value});
  }


  postFormSubmit() {
    var userServiceData:any;
    this.userService.senderSharedParam.subscribe(param=>{userServiceData = param;})
    //https://developers.novaposhta.ua/view/model/a90d323c-8512-11ec-8ced-005056b2dbe1/method/a965630e-8512-11ec-8ced-005056b2dbe1

    var postFormValue = this.postForm.getRawValue()['postFormsArray'];


    postFormValue.forEach(async (arr:any) =>{
      var recipientRes:any = await this.createCounterparty(
        arr['recieverName'],
        arr['recieverSurname'],
        arr['recieverNumber'].replace(/\+|\s/g, ''),
      );
      var recipient = recipientRes['recipient'];
      var recipientContact = recipientRes['recipientContact'];


      var data = {
        "apiKey": this.MY_API_KEY,
        "modelName": "InternetDocument",
        "calledMethod": "save",
        "methodProperties": {
          // "SenderWarehouseIndex" : "101/102",
          // "RecipientWarehouseIndex" : "101/102",
          "PayerType" : arr['payerType'],
          "PaymentMethod" : arr['paymentMethod'],
          "DateTime" : this.datepipe.transform(arr['date'], 'dd.MM.YYYY'),
          "CargoType" : arr['cargoType'],
          "VolumeGeneral" : arr['totalVolume'],
          "Weight" : arr['weight'],
          "ServiceType" : "WarehouseWarehouse",
          "SeatsAmount" : arr['seatsAmount'],
          "Description" : arr['description'],
          "Cost" : arr['assessedValue'],
          
          
          "CitySender" : userServiceData['CitySender'],
          "SenderAddress" : userServiceData['SenderAddress'],
          "Sender" :userServiceData['Sender'], 
          "ContactSender" : userServiceData['ContactSender'],
          "SendersPhone" : userServiceData['SendersPhone'],

          "CityRecipient" : arr['deliveryDepartmentCityRef'],
          "RecipientAddress" : arr['deliveryDepartmentAddressRef'],
          "Recipient" : recipient, 
          "ContactRecipient" : recipientContact,
          "RecipientsPhone" : arr['recieverNumber'].replace(/\+|\s/g, '')
        }
      }

      console.log(data)


      // this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
      // .subscribe((response:any) =>{
      //   console.log(response);
      // }) 
    })

    // clear the form
    this.postFormsArray.clear()
    this.addDeliveryToForm();
    this.toastr.success('Your post were successfully created', 'Created!' , this.toastrOptions);
  }




  subscribeToPostApi(){  
    // subscribe to each input
    document.querySelectorAll('.deliveryDepartmentCity').forEach(
      (element:any) => {
        var closestTableIndex = element.closest('table')?.getAttribute('ng-reflect-name');

        if(!this.subscribed_elements.includes(closestTableIndex + '_deliveryDepartmentCity')){
          this.subscribed_elements.push(closestTableIndex + '_deliveryDepartmentCity')

          var searchdeliveryDepartmentCity$:Observable<Event> = fromEvent<Event>(element!, 'input')

          searchdeliveryDepartmentCity$.pipe(
            debounceTime(500),
            distinctUntilChanged(),
          ).subscribe({
            next: value => {
              var target = (value.target as HTMLInputElement)
              var className = target.className.split(' ')[0]
              this.searchDepartmentAddress(target.value, className, Number(closestTableIndex))
            },
          })
        }
      });    
  }


  async createCounterparty(f_n:string, l_n:string, phone:string){
    var data = {
      "apiKey": this.MY_API_KEY,
      "modelName": "Counterparty",
      "calledMethod": "save",
      "methodProperties": {
        "FirstName" : f_n,
        // "MiddleName" : "",
        "LastName" : l_n,
        "Phone" : phone,

        "CounterpartyType" : "PrivatePerson",
        "CounterpartyProperty" : "Recipient"
      }
    }

    
    var res:any = await this.http.post('https://api.novaposhta.ua/v2.0/json/', data).toPromise()
    var recipient = res['data'][0]['Ref'];
    var recipientContact = res['data'][0]['ContactPerson']['data'][0]['Ref'];
    
    return {
      'recipient':recipient,
      'recipientContact':recipientContact,
    }
  }
  
  create() {
    var data:any = {
      'npToken': this.MY_API_KEY,
      'postData':{
        "PayerType": "Recipient",
        "PaymentMethod": "Cash",
        "DateTime": "26.10.2022",
        "CargoType": "Cargo",
        "VolumeGeneral": 0.003672,
        "Weight": 0.5,
        "ServiceType": "WarehouseWarehouse",
        "SeatsAmount": 1,
        "Description": "Конфеты",
        "Cost": "1000",
        "CitySender": "e71a2cab-4b33-11e4-ab6d-005056801329",
        "SenderAddress": "16922804-e1c2-11e3-8c4a-0050568002cf",
        "Sender": "fb5767ac-0892-11eb-8513-b88303659df5",
        "ContactSender": "fb583917-0892-11eb-8513-b88303659df5",
        "SendersPhone": "+380983435878",
        "CityRecipient": "e71a2cab-4b33-11e4-ab6d-005056801329",
        "RecipientAddress": "7b422fa8-e1b8-11e3-8c4a-0050568002cf",
        "Recipient": "fb81b0a9-0892-11eb-8513-b88303659df5",
        "ContactRecipient": "8234e66b-5114-11ed-a60f-48df37b921db",
        "RecipientsPhone": "380980363455"
      }
    }

    data['postData']['RecipientName'] = 'RecipientName';
    data['postData']['RecipientSurname'] = 'RecipientSurname';


    this.http.post(this.API_DOMAIN + '/posts/', JSON.stringify(data), this.httpOptions).subscribe((response:any) =>{
      console.log(response);
    });
  }

}