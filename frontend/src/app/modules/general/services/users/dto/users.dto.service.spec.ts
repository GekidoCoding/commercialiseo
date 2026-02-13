import { TestBed } from '@angular/core/testing';
import {UsersDtoService} from "./users.dto.service";


describe('UsersService', () => {
  let service: UsersDtoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersDtoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
