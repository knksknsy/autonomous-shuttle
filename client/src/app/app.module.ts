import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

// modules
import { AppRoutingModule } from './app-routing.module';

// ngx-bootstrap modules
import { ModalModule } from 'ngx-bootstrap';


// components
import { AppComponent } from './app.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';

import { BookingComponent } from './components/booking/booking.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { TerminalTableComponent } from './components/terminal-table/terminal-table.component';

// services

// pipes
import { DatePipe, UpperCasePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    BookingComponent,
    MenuBarComponent,
    TerminalComponent,
    TerminalTableComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    AppRoutingModule
  ],
  providers: [DatePipe, UpperCasePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
