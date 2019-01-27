import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BookingComponent } from './components/booking/booking.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { TerminalTableComponent } from './components/terminal-table/terminal-table.component';

const appRoutes: Routes = [
    {
        path: '',
        component: BookingComponent
    },
    {
        path: 'terminal',
        component: TerminalTableComponent
    },
    {
        path: 'terminal/:ids',
        component: TerminalComponent
    }
]

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ],
    providers: []
})
export class AppRoutingModule { }
