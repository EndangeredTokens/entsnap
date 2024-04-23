import { TestBed } from '@angular/core/testing';

import { DraftReportService } from './draft-report.service';

describe('DraftReportService', () => {
  let service: DraftReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DraftReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
