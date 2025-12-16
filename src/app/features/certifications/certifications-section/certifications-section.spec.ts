import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificationsSection } from './certifications-section';
import { CertificationsService } from '../../../core/services/certifications.service';
import { of } from 'rxjs';
import { ApiState } from '../../../core/models/api.state';

describe('CertificationsSection', () => {
  let component: CertificationsSection;
  let fixture: ComponentFixture<CertificationsSection>;
  let certificationsServiceMock: any;

  beforeEach(async () => {
    certificationsServiceMock = {
      getHomeItems: jasmine.createSpy('getHomeItems').and.returnValue(of(ApiState.success([])))
    };

    await TestBed.configureTestingModule({
      imports: [CertificationsSection],
      providers: [
        { provide: CertificationsService, useValue: certificationsServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CertificationsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
