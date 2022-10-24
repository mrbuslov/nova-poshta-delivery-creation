import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, ReplaySubject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_DOMAIN:string = 'http://127.0.0.1/api' 
  private MY_API_KEY = '3129835b6fc88da2c371232503e5aa88'
  
  private httpOptions: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
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
  }

  public login(user_dict:any){
    return this.http.post(this.API_DOMAIN + '/token/', JSON.stringify(user_dict), this.httpOptions);
  }


  public refreshToken(refreshT:string){
    return this.http.post(this.API_DOMAIN + '/token/refresh/', JSON.stringify({'refresh':refreshT}), this.httpOptions);
  }




  public register(user_dict:any){
    return this.http.post(this.API_DOMAIN + '/registration/', JSON.stringify(user_dict), this.httpOptions);
  }
  

}
