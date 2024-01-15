import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalComponent } from './components/global/global.component';
import { ContinentsComponent } from './components/continents/continents.component';

const routes: Routes = [{ path: '', component: GlobalComponent }, {path: 'continent/:continent', component:ContinentsComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
