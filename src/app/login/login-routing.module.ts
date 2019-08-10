import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/core';
import { LoginComponent } from './login.component';
import { LoginForgotComponent } from './login-forgot/login-forgot.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { title: extract('Login') } },
  {
    path: 'login/forgot',
    component: LoginForgotComponent,
    data: { title: extract('Forgot Password'), canActivate: [] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class LoginRoutingModule {}
