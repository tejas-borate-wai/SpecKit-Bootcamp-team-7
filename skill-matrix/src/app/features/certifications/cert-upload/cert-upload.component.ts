import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import * as CertificationsActions from '../../../core/store/certifications/certifications.actions';
import { selectUploadInProgress } from '../../../core/store/certifications/certifications.selectors';
import { selectSkillDefinitions } from '../../../core/store/skills/skills.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { CreateCertificationPayload, FileMetadata } from '../../../shared/models/certification.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { ALLOWED_FORMATS, MAX_FILE_SIZE } from '../../../shared/models/file-validation.model';

function expiryAfterIssueValidator(group: AbstractControl): ValidationErrors | null {
  const issueDate = group.get('issueDate')?.value;
  const expiryDate = group.get('expiryDate')?.value;
  if (!issueDate || !expiryDate) return null;
  const issue = new Date(issueDate);
  const expiry = new Date(expiryDate);
  return expiry > issue ? null : { expiryBeforeIssue: true };
}

function fileSizeValidator(control: AbstractControl): ValidationErrors | null {
  const meta = control.value as FileMetadata | null;
  if (!meta) return null;
  return meta.fileSize <= MAX_FILE_SIZE ? null : { fileTooLarge: true };
}

function fileFormatValidator(control: AbstractControl): ValidationErrors | null {
  const meta = control.value as FileMetadata | null;
  if (!meta) return null;
  return ALLOWED_FORMATS.includes(meta.fileType) ? null : { invalidFileFormat: true };
}

@Component({
  selector: 'app-cert-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './cert-upload.component.html',
  styleUrl: './cert-upload.component.scss',
})
export class CertUploadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  uploadInProgress$: Observable<boolean> = this.store.select(selectUploadInProgress);
  skillDefinitions$: Observable<SkillDefinition[]> = this.store.select(selectSkillDefinitions);
  hasSkills$: Observable<boolean> = this.skillDefinitions$.pipe(map((defs) => defs.length > 0));

  form!: FormGroup;
  selectedFileName: string | null = null;
  today = new Date();

  ngOnInit(): void {
    this.store.dispatch(SkillsActions.loadSkillLibrary());

    this.form = this.fb.group(
      {
        certName: ['', [Validators.required, Validators.maxLength(200)]],
        skillId: ['', Validators.required],
        issuingOrg: ['', [Validators.required, Validators.maxLength(200)]],
        issueDate: [null, Validators.required],
        expiryDate: [null, Validators.required],
        fileMetadata: [null, [Validators.required, fileSizeValidator, fileFormatValidator]],
      },
      { validators: expiryAfterIssueValidator }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFileName = file.name;
    const meta: FileMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: `uploads/${Date.now()}-${file.name}`,
    };
    this.form.get('fileMetadata')!.setValue(meta);
    this.form.get('fileMetadata')!.markAsTouched();
  }

  triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const meta = raw.fileMetadata as FileMetadata;
    const formatDate = (d: Date) => d.toISOString().substring(0, 10);

    const payload: CreateCertificationPayload = {
      certName: raw.certName.trim(),
      skillId: raw.skillId,
      issuingOrg: raw.issuingOrg.trim(),
      issueDate: formatDate(new Date(raw.issueDate)),
      expiryDate: formatDate(new Date(raw.expiryDate)),
      filePath: meta.filePath,
    };

    this.store.dispatch(CertificationsActions.uploadCertification({ payload }));
  }

  onCancel(): void {
    this.router.navigate(['/certifications']);
  }

  get fileMeta(): FileMetadata | null {
    return this.form.get('fileMetadata')?.value ?? null;
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatAllowed(): string {
    return 'PDF, JPEG, PNG (max 5 MB)';
  }
}
