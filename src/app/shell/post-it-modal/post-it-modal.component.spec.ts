import { of, Subject, throwError } from 'rxjs';
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

  it('keeps the note open and available for retry when sending fails', () => {
    const { component, userMessageServiceStub, modalCtrlStub, toastrStub } = buildComponent();
    userMessageServiceStub.sendUserMessage.mockReturnValue(throwError(() => new Error('send failed')));
    component.ngOnInit();
    component.createUserMessageForm.setValue({ messageType: 'user', messageBody: 'keep this note' });

    component.sendTheMessage();

    expect(component.isSubmitting).toBe(false);
    expect(component.createUserMessageForm.get('messageBody')!.value).toBe('keep this note');
    expect(toastrStub.error).toHaveBeenCalledWith('Message was not sent. Your note is still here; please try again.');
    expect(modalCtrlStub.dismiss).not.toHaveBeenCalled();
  });

  it('ignores repeated send clicks while a message request is pending', () => {
    const { component, userMessageServiceStub } = buildComponent();
    const pendingRequest = new Subject<any>();
    userMessageServiceStub.sendUserMessage.mockReturnValue(pendingRequest);
    component.ngOnInit();
    component.createUserMessageForm.setValue({ messageType: 'user', messageBody: 'one note' });

    component.sendTheMessage();
    component.sendTheMessage();

    expect(userMessageServiceStub.sendUserMessage).toHaveBeenCalledTimes(1);
    expect(component.isSubmitting).toBe(true);
    pendingRequest.error(new Error('send failed'));
    expect(component.isSubmitting).toBe(false);
  });
});
