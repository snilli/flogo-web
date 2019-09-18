import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionStatusComponent } from './action-status.component';

describe('ActionStatusComponent', () => {
  let component: ActionStatusComponent;
  let fixture: ComponentFixture<ActionStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionStatusComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
