import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PatientAvatarService } from './patient-avatar.service';
import { Patient } from '../patient';

@Component({
  selector: 'app-patient-avatar',
  templateUrl: './patient-avatar.component.html',
  styleUrls: ['./patient-avatar.component.scss'],
  standalone: false
})
export class PatientAvatarComponent implements OnInit, OnChanges, OnDestroy {
  private static avatarStyleCache = new Map<string, SafeStyle>();
  private static noAvatarSet = new Set<string>();

  avatarUrl: SafeStyle;
  @HostBinding('class.is-circle') isCircle: boolean = false;
  @Input() patient: Patient;
  @Input() type: string;
  avatarExists: boolean;

  private observer?: IntersectionObserver;
  private isDestroyed = false;

  constructor(
    private patientAvatarService: PatientAvatarService,
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  static clearCache(patientId?: string) {
    if (patientId) {
      this.avatarStyleCache.delete(patientId);
      this.noAvatarSet.delete(patientId);
      try {
        sessionStorage.removeItem(patientId);
      } catch (_error) {}
    } else {
      this.avatarStyleCache.clear();
      this.noAvatarSet.clear();
      try {
        sessionStorage.clear();
      } catch (_error) {}
    }
  }

  ngOnInit() {
    this.isCircle = this.type == 'circle';
    this.loadAvatar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.type) {
      this.isCircle = this.type == 'circle';
    }
    if (changes.patient && !changes.patient.firstChange) {
      this.disconnectObserver();
      this.loadAvatar();
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.disconnectObserver();
  }

  private disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private loadAvatar() {
    if (!this.patient?.patientId) {
      this.avatarUrl = null;
      this.avatarExists = false;
      return;
    }

    const patientId = this.patient.patientId.toString();

    // 1. In-memory positive cache
    const cachedStyle = PatientAvatarComponent.avatarStyleCache.get(patientId);
    if (cachedStyle) {
      this.avatarUrl = cachedStyle;
      this.avatarExists = true;
      return;
    }

    // 2. In-memory negative cache (known to have no avatar)
    if (PatientAvatarComponent.noAvatarSet.has(patientId)) {
      this.avatarUrl = null;
      this.avatarExists = false;
      return;
    }

    // 3. Persistent session storage cache
    try {
      const storeDeserialized = sessionStorage.getItem(patientId);
      if (storeDeserialized === 'none' || storeDeserialized === 'NO_AVATAR') {
        PatientAvatarComponent.noAvatarSet.add(patientId);
        this.avatarUrl = null;
        this.avatarExists = false;
        return;
      }

      if (storeDeserialized && storeDeserialized.length) {
        const safeStyle = this.sanitizer.bypassSecurityTrustStyle(`url(${storeDeserialized})`);
        PatientAvatarComponent.avatarStyleCache.set(patientId, safeStyle);
        this.avatarUrl = safeStyle;
        this.avatarExists = true;
        return;
      }
    } catch (_error) {
      // sessionStorage restricted or disabled
    }

    // 4. Lazy-load via IntersectionObserver if supported; otherwise fetch immediately
    if (typeof IntersectionObserver === 'undefined' || !this.elementRef?.nativeElement) {
      this.fetchAvatar(patientId);
      return;
    }

    this.disconnectObserver();
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.disconnectObserver();
          this.fetchAvatar(patientId);
        }
      },
      { rootMargin: '200px' }
    );
    this.observer.observe(this.elementRef.nativeElement);
  }

  private fetchAvatar(patientId: string) {
    if (this.isDestroyed) {
      return;
    }

    this.patientAvatarService.getPatientAvatarByPatientId(this.patient.patientId).subscribe({
      next: (data: any) => {
        if (this.isDestroyed) {
          return;
        }

        if (data !== null && !data.errno) {
          const reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onloadend = () => {
            if (this.isDestroyed) {
              return;
            }
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
          try {
            sessionStorage.setItem(patientId, 'none');
          } catch (_error) {}
          PatientAvatarComponent.noAvatarSet.add(patientId);
          this.avatarUrl = null;
          this.avatarExists = false;
          this.changeDetectorRef.markForCheck();
        }
      },
      error: () => {
        if (this.isDestroyed) {
          return;
        }
        try {
          sessionStorage.setItem(patientId, 'none');
        } catch (_error) {}
        PatientAvatarComponent.noAvatarSet.add(patientId);
        this.avatarUrl = null;
        this.avatarExists = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }
}
