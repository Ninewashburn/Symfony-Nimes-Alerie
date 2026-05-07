import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ContactComponent } from './contact';
import { environment } from '@env/environment';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with sent() = false and sending() = false', () => {
    expect(component.sent()).toBeFalse();
    expect(component.sending()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('should set sending() to true while request is in flight', () => {
    component.form = { email: 'test@test.com', subject: 'general', message: 'Un message de test.' };
    component.onSubmit();

    expect(component.sending()).toBeTrue();

    const req = httpMock.expectOne(`${environment.apiUrl}/contact`);
    req.flush({ message: 'OK' });
  });

  it('should set sent() to true on success', () => {
    component.form = { email: 'test@test.com', subject: 'general', message: 'Un message de test.' };
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/contact`);
    req.flush({ message: 'Votre message a bien été reçu.' });

    expect(component.sent()).toBeTrue();
    expect(component.sending()).toBeFalse();
    expect(component.form.email).toBe('');
  });

  it('should set error() on failure', () => {
    component.form = { email: 'test@test.com', subject: 'general', message: 'Un message de test.' };
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/contact`);
    req.flush({ error: 'Email invalide.' }, { status: 422, statusText: 'Unprocessable Entity' });

    expect(component.sent()).toBeFalse();
    expect(component.sending()).toBeFalse();
    expect(component.error()).toBe('Email invalide.');
  });
});
