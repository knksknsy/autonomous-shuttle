import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalTableComponent } from './terminal-table.component';

describe('TerminalTableComponent', () => {
  let component: TerminalTableComponent;
  let fixture: ComponentFixture<TerminalTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
