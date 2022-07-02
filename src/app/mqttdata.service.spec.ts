import { TestBed } from '@angular/core/testing';

import { MQTTDataService } from './mqttdata.service';

describe('MQTTDataService', () => {
  let service: MQTTDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MQTTDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
