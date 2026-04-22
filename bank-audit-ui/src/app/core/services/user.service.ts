import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<User[]>(this.API);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  create(request: CreateUserRequest) {
    return this.http.post<User>(this.API, request);
  }

  update(id: number, request: UpdateUserRequest) {
    return this.http.put<User>(`${this.API}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
