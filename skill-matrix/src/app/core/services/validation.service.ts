import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ERROR_MESSAGES } from '../constants/error-messages';

@Injectable({ providedIn: 'root' })
export class ValidationService {

  getErrorMessage(control: AbstractControl | null, customMessages?: Record<string, string>): string | null {
    if (!control || !control.errors || !control.touched) return null;

    const messages = { ...ERROR_MESSAGES, ...customMessages };

    for (const errorKey of Object.keys(control.errors)) {
      const message = messages[errorKey as keyof typeof messages];
      if (typeof message === 'string') return message;
    }

    return null;
  }

  static dateAfterValidator(startField: string, endField: string, errorKey: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get(startField)?.value;
      const end = control.get(endField)?.value;
      if (start && end && new Date(end) <= new Date(start)) {
        control.get(endField)?.setErrors({ [errorKey]: true });
        return { [errorKey]: true };
      }
      return null;
    };
  }

  static maxFileSizeValidator(maxSizeBytes: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file: File = control.value;
      if (file && file.size > maxSizeBytes) {
        return { fileSize: true };
      }
      return null;
    };
  }

  static fileFormatValidator(allowedTypes: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file: File = control.value;
      if (file && !allowedTypes.includes(file.type)) {
        return { fileFormat: true };
      }
      return null;
    };
  }
}
