import { TestBed } from '@angular/core/testing';

import { RedirectFromAuthGuard } from './redirect-from-auth.guard';

describe('RedirectFromAuthGuard', () => {
  let guard: RedirectFromAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RedirectFromAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
