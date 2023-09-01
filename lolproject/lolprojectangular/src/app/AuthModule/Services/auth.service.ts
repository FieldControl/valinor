import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { IUser } from 'src/app/UsersModule/Interfaces/users.interface';
import { environment } from 'src/environments/environment';
import { BaseService } from 'src/shared/Utils/base-service-request/base-service-request.service';
import { CenterRequestService } from 'src/shared/Utils/center-request/center-request.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {

  constructor(private centerService: CenterRequestService) {super()}

  login(username:string, password:string): Observable<any> {
    return this.centerService.get(`${this.apiAuthenticationUrl}users?username=${username}&password=${password}`)
  }

  createUser(user: IUser): Observable<any> {
    return this.centerService.post(`${this.apiAuthenticationUrl}users`, user);
  }

  getUserByName(username: string): Observable<any>{
    return this.centerService.get(`${this.apiAuthenticationUrl}users?username=${username}`)
  }
}
