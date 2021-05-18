import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SerialLetterComponent } from './routes/serial-letter/serial-letter.component';
import { AboutComponent } from './routes/about/about.component';

const routes: Routes = [
  { path: '', component: SerialLetterComponent },
  { path: 'about', component: AboutComponent },
  { path: '*',  redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
