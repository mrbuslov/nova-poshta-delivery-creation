import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PostComponent } from './post/post.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { PostService } from './post/post.service';
import { AccountComponent } from './account/account.component';
import { UserService } from './account/user.service';
import { DatePipe } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    AppComponent,
    PostComponent,
    AccountComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule ,
    FormsModule,

    CommonModule,
    ToastrModule.forRoot(), // ToastrModule added
    BrowserAnimationsModule, // required animations module
  ],
  providers: [PostService, UserService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
