import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, ReplaySubject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_DOMAIN:string = 'http://127.0.0.1/api' 
  private MY_API_KEY = '3129835b6fc88da2c371232503e5aa88'
  
  private httpOptions: any;
  public token: string;
  public token_expires: Date;
  public email: string;
  public loginErrors:any = [];


  // Create this to change data between components (in this case Sender data)
  senderSharedParam = new ReplaySubject(1);
  changeSenderParam(value:any) { this.senderSharedParam.next(value);}

  /* 
    --- the same ---

    private senderParamSource = new BehaviorSubject(null);
    senderSharedParam = this.senderParamSource.asObservable();
    changeSenderParam(param:any) {
      this.senderParamSource.next(param)
    }
  */
  
  // loginToken
  loginTokenParam = new ReplaySubject(1);
  changeLoginTokenParam(value:any) {this.loginTokenParam.next(value);}




  constructor(
    private http: HttpClient
  ) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.token
      }),
    }
  }

  public login(user_dict:any){
    // this.http.post(this.API_DOMAIN + '/api-token-auth/', JSON.stringify(user), this.httpOptions)
    // .subscribe(
    //   (data:any) => {
    //     // this.updateData(data['token'])
    //     console.log(data)
    //   },
    //   error => {
    //     this.loginErrors = error['error']
    //   }
    // )

    return this.http.post(this.API_DOMAIN + '/token/', JSON.stringify(user_dict), this.httpOptions)
    .pipe(
      (data:any) => { return data;},
    )
  }


  public refreshToken(refreshT:string){
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }
    return this.http.post(this.API_DOMAIN + '/token/refresh/', JSON.stringify({'refresh':refreshT}), httpOptions)
    .pipe(
      (data:any) => {
        return data['access'];
      },
    )
  }


  public logout(){
    this.token = null;
    this.token_expires = null;
    this.email = null;

    localStorage.removeItem('currentUser');
  }

  private updateData(token:string){
    console.log('update data')
    console.log(token)
    this.token=token;
    this.loginErrors=[];

    const tokenParts = this.token.split(/\./);
    const tokenDecoded = JSON.parse(window.atob(tokenParts[1])) ;   // atob decodes a data string that has been encoded using base-64
    this.token_expires = new Date(tokenDecoded.exp * 1000);
    this.email = tokenDecoded.email;
    
    this.getUserDataFromServer(this.MY_API_KEY);
  }

  fillUserFormWithData(data:any){
    return data;
  }



  
  public getUserDataFromServer(np_api_key:string){
    this.http.get(this.API_DOMAIN + '/users/' + np_api_key + '/')
    .subscribe(
      (data:any) => {
        this.fillUserFormWithData(data);
      },
      error => {
        this.loginErrors = error['error']
      }
    )
  }

}
