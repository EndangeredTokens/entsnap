import { TestBed } from '@angular/core/testing';

import { TreePropertiesService } from './tree-properties.service';

describe('TreePropertiesService', () => {
  let service: TreePropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreePropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
