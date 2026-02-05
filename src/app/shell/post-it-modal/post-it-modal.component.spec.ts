import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { PostItModalComponent } from './post-it-modal.component';

const buildComponent = () => {
  const modalCtrlStub = { dismiss: jest.fn() } as any;
  const teamMessageServiceStub = { sendTeamMessage: jest.fn(() => of(true)) } as any;
  const userMessageServiceStub = { sendUserMessage: jest.fn(() => of(true)) } as any;
  const toastrStub = { success: jest.fn(), error: jest.fn() } as any;
  const routeStub = { snapshot: { data: {} } } as any;

  const component = new PostItModalComponent(
    modalCtrlStub,
    new FormBuilder(),
    teamMessageServiceStub,
    userMessageServiceStub,
    routeStub,
    toastrStub
  );

  component.userMessage = { messageBody: '', messageType: '' } as any;
  component.teamId = 'team-1';

  return { component, modalCtrlStub, teamMessageServiceStub, userMessageServiceStub, toastrStub };
};

describe('PostItModalComponent (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks message length and sends user messages', () => {
    const { component, userMessageServiceStub, modalCtrlStub, toastrStub } = buildComponent();

    component.ngOnInit();
    component.createUserMessageForm.setValue({ messageType: 'user', messageBody: 'note' });

    component.onTextAreaChange(null);
    expect(component.characters).toBe(4);

    component.sendTheMessage();

    expect(userMessageServiceStub.sendUserMessage).toHaveBeenCalled();
    expect(toastrStub.success).toHaveBeenCalled();
    expect(modalCtrlStub.dismiss).toHaveBeenCalled();
  });

  it('sends team messages when selected', () => {
    const { component, teamMessageServiceStub, modalCtrlStub } = buildComponent();

    component.ngOnInit();
    component.createUserMessageForm.setValue({ messageType: 'team', messageBody: 'hello team' });

    component.sendTheMessage();

    expect(teamMessageServiceStub.sendTeamMessage).toHaveBeenCalledWith('team-1', component.userMessage);
    expect(modalCtrlStub.dismiss).toHaveBeenCalled();
  });
});
