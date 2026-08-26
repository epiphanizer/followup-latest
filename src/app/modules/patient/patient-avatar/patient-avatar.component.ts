import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PatientAvatarService } from './patient-avatar.service';
import { Patient } from '../patient';

@Component({
  selector: 'app-patient-avatar',
  templateUrl: './patient-avatar.component.html',
  styleUrls: ['./patient-avatar.component.scss'],
  standalone: false
})
export class PatientAvatarComponent implements OnInit, OnChanges {
  private static avatarStyleCache = new Map<string, SafeStyle>();

  avatarUrl: SafeStyle;
  isCircle: boolean = false;
  @Input() patient: Patient;
  @Input() type: string;
  /**
   * This guy is plaintext encoded base64
   */
  avatarExists: boolean;
  constructor(
    private patientAvatarService: PatientAvatarService,
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isCircle = this.type == 'circle';
    this.loadAvatar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.type) {
      this.isCircle = this.type == 'circle';
    }
    if (changes.patient && !changes.patient.firstChange) {
      this.loadAvatar();
    }
  }

  private loadAvatar() {
    if (!this.patient?.patientId) {
      this.avatarUrl = null;
      this.avatarExists = false;
      return;
    }

    const patientId = this.patient.patientId.toString();
    const cachedStyle = PatientAvatarComponent.avatarStyleCache.get(patientId);
    if (cachedStyle) {
      this.avatarUrl = cachedStyle;
      this.avatarExists = true;
      return;
    }

    const storeDeserialized = sessionStorage.getItem(patientId);
    if (storeDeserialized && storeDeserialized.length) {
      const safeStyle = this.sanitizer.bypassSecurityTrustStyle(`url(${storeDeserialized})`);
      PatientAvatarComponent.avatarStyleCache.set(patientId, safeStyle);
      this.avatarUrl = safeStyle;
      this.avatarExists = true;
      return;
    }

    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe((data: any) => {
      if (data !== null && !data.errno) {
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          try {
            sessionStorage.setItem(patientId, base64data);
          } catch (_error) {
            // If storage is full, skip persistent caching and keep in-memory value only.
          }

          const safeStyle = this.sanitizer.bypassSecurityTrustStyle(`url(${base64data})`);
          PatientAvatarComponent.avatarStyleCache.set(patientId, safeStyle);
          this.avatarUrl = safeStyle;
          this.avatarExists = true;
          this.changeDetectorRef.markForCheck();
        };
      } else {
        sessionStorage.setItem(patientId, '');
      }
    });
  }
}
