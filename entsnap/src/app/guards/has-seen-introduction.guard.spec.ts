import { TestBed } from '@angular/core/testing';

import { HasSeenIntroductionGuard } from './has-seen-introduction.guard';

describe('HasSeenIntroductionGuard', () => {
  let guard: HasSeenIntroductionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HasSeenIntroductionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
