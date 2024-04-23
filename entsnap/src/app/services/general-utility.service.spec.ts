import { TestBed } from '@angular/core/testing';

import { GeneralUtilityService } from './general-utility.service';

describe('GeneralUtilityService', () => {
  let service: GeneralUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
