import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggerSelectorComponent } from './trigger-selector.component';

describe('TriggerSelectorComponent', () => {
  let component: TriggerSelectorComponent;
  let fixture: ComponentFixture<TriggerSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TriggerSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
