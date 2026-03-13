import { Pipe, PipeTransform } from '@angular/core';
import { CertificationStatus } from '../models/certification.model';
import { computeCertificationStatus } from '../utils/certification.util';

@Pipe({
  name: 'certificationStatus',
  standalone: true,
  pure: true,
})
export class CertificationStatusPipe implements PipeTransform {
  transform(expiryDate: string, referenceDate: Date = new Date()): CertificationStatus {
    return computeCertificationStatus(expiryDate, referenceDate);
  }
}
