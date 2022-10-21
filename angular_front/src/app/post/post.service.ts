import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  postForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) { }


  public getPostForm(){
    this.postForm = this.formBuilder.group({
      postFormsArray: this.formBuilder.array([this.getPostFormGroup()]),
    })
  }
  get postFormsArray(){
    return this.postForm.get("postFormsArray") as FormArray;
  }

  getPostFormGroup() {
    return this.formBuilder.group({
      senderName:['', Validators.required],
      senderSurname:'',
      senderNumber:'',

      senderDepartmentCity:['', Validators.required],
      senderDepartmentCityRef: '',
      senderDepartmentAddress:'',
      senderDepartmentAddressRef:'',

      recieverName:'',
      recieverSurname:'',
      recieverNumber:'',

      deliveryDepartmentCity:'',
      deliveryDepartmentCityRef:'',
      deliveryDepartmentAddress:'',
      deliveryDepartmentAddressRef:'',
      deliveryDescription:'',
      deliveryAssessedValue:['',  [Validators.required, Validators.min(10), Validators.max(1000000)]],

      showSeachedCityUl:false,
      showSeachedDepartmentOptions:false,
      showDeliverySeachedCityUl:false,
      showDeliverySeachedDepartmentOptions:false,
    })
  }

  


  // searchDepartmentAddress(value:string, what_search:string='senderDepartmentCity'){
  //   console.log(value)
  //   var data = {
  //     modelName: 'Address',
  //     calledMethod: 'searchSettlements',
  //     methodProperties: {
  //       CityName: value,
  //       Limit: 50
  //     },
  //     apiKey: this.MY_API_KEY,
  //   }

  //   this.http.post('https://api.novaposhta.ua/v2.0/json/', data)
  //   .subscribe((response:any) =>{
  //     console.log(response)
  //     this.fill_in_searching_results(response, what_search);
  //   }) 
  // }
  


  // fill_in_searching_results(response:any, search_type:string='senderDepartmentCity'){
  //   if(response.success !== false && response.data[0] !== undefined && response.data[0].TotalCount !== 0){
  //     var searching:any;
      
  //     // ----------------------------------- Sender ------------------------------------------
  //     if(search_type === 'senderDepartmentCity'){
  //       searching = response.data[0].Addresses;

  //       for(var i in searching){
  //         this.searched_city_response.push(
  //           {
  //             full_name:searching[i].Present,
  //             short_name:searching[i].MainDescription,
  //           }
  //         )
  //       }

  //       this.showSeachedCityUl = true;
  //     }
  //     else if(search_type === 'senderWarehouse'){
  //       searching = response.data;
  //       for(var i in searching){
  //         this.searched_department_response.push(
  //           {
  //             value:searching[i].Description,
  //             name: '№ ' + searching[i].Number + ' - ' + searching[i].ShortAddress,
  //           }
  //         )
  //       }
        
  //       this.postForm.get("senderDepartmentAddress")!.patchValue(searching[0].Description); // Default value
  //       this.showSeachedDepartmentOptions = true;
  //     }
  //     // ---------------------------------- Receiver -----------------------------------------
  //     else if(search_type === 'deliveryDepartmentCity'){
  //       searching = response.data[0].Addresses;

  //       for(var i in searching){
  //         this.searched_delivery_city_response.push(
  //           {
  //             full_name:searching[i].Present,
  //             short_name:searching[i].MainDescription,
  //           }
  //         )
  //       }

  //       this.showDeliverySeachedCityUl = true;
  //     }
  //     else if(search_type === 'receiverWarehouse'){
  //       searching = response.data;
  //       for(var i in searching){
  //         this.searched_delivery_department_response.push(
  //           {
  //             value:searching[i].Description,
  //             name: '№ ' + searching[i].Number + ' - ' + searching[i].ShortAddress,
  //           }
  //         )
  //       }
        
  //       this.postForm.get("deliveryDepartmentAddress")!.patchValue(searching[0].Description); // Default value
  //       this.showDeliverySeachedDepartmentOptions = true;
  //     }

      
  //   }
  //   else{
  //     // this.searched_city_response = [];
  //     // this.searched_delivery_city_response = [];
  //   }
  // }

  // loadSenderPostDepartments(event_id:string, full_city:string, short_city:string){
  //   var what_warehouse = '';
  //   if(event_id === 'senderDepartmentCity'){
  //     this.postForm.get('senderDepartmentCity')!.setValue(full_city);
  //     this.showSeachedCityUl = false;
  //     what_warehouse = 'senderWarehouse';
  //   }
  //   else if(event_id === 'deliveryDepartmentCity'){
  //     this.postForm.get('deliveryDepartmentCity')!.setValue(full_city);
  //     this.showDeliverySeachedCityUl = false;
  //     what_warehouse = 'receiverWarehouse';
  //   }
}
