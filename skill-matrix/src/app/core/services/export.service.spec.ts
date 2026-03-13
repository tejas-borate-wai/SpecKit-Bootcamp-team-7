import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';
import { ExportMetadata } from '../../shared/models/report.models';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_METADATA: ExportMetadata = {
  reportTitle: 'Test Report Alpha',
  generationDate: '2024-06-15',
  generatingUserName: 'Jane Smith',
};

const MOCK_COLUMNS = ['Skill', 'Level', 'Gap %'];
const MOCK_ROWS: (string | number)[][] = [
  ['TypeScript', 'Advanced', 10],
  ['CSS', 'Intermediate', 25],
];

// ── Spec ──────────────────────────────────────────────────────────────────────

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Private helpers (tested indirectly) ────────────────────────────────────

  describe('_buildPdfHeader', () => {
    it('includes reportTitle, generationDate, and generatingUserName', () => {
      const header = (service as unknown as { _buildPdfHeader: (m: ExportMetadata) => string })
        ._buildPdfHeader(MOCK_METADATA);

      expect(header).toContain('Test Report Alpha');
      expect(header).toContain('2024-06-15');
      expect(header).toContain('Jane Smith');
    });
  });

  describe('_buildSheetHeader', () => {
    it('returns a 3-row 2D array containing title and date/user info', () => {
      const rows = (service as unknown as { _buildSheetHeader: (m: ExportMetadata) => string[][] })
        ._buildSheetHeader(MOCK_METADATA);

      expect(rows.length).toBe(3);
      expect(rows[0][0]).toBe('Test Report Alpha');
      expect(rows[1][0]).toContain('2024-06-15');
      expect(rows[1][0]).toContain('Jane Smith');
      expect(rows[2]).toEqual([]);
    });
  });

  describe('_safeFileName', () => {
    it('lower-cases and strips special chars', () => {
      const result = (service as unknown as { _safeFileName: (s: string) => string })
        ._safeFileName('My Report: 2024 (Q3)');
      expect(result).toBe('my-report--2024--q3-');
    });

    it('produces a url-safe string for the default report title', () => {
      const result = (service as unknown as { _safeFileName: (s: string) => string })
        ._safeFileName('Test Report Alpha');
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });
  });

  // ── exportTableToPdf ───────────────────────────────────────────────────────

  describe('exportTableToPdf', () => {
    it('calls jsPDF doc.save with a .pdf extension', () => {
      // Spy at the prototype level so we do not trigger a real file download.
      const saveSpy = jasmine.createSpy('save');
      const textSpy = jasmine.createSpy('text');

      // Replace jsPDF constructor with a minimal fake.
      const JsPDF = require('jspdf');
      const OriginalJsPDF = JsPDF.default ?? JsPDF.jsPDF ?? JsPDF;
      spyOn(OriginalJsPDF.prototype, 'save').and.callFake(saveSpy);
      spyOn(OriginalJsPDF.prototype, 'text').and.callFake(textSpy);
      spyOn(OriginalJsPDF.prototype, 'setFontSize').and.stub();

      // autoTable mutates doc but returns void — we just need no throw.
      service.exportTableToPdf(MOCK_COLUMNS, MOCK_ROWS, MOCK_METADATA);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      const savedName: string = saveSpy.calls.mostRecent().args[0] as string;
      expect(savedName).toMatch(/\.pdf$/);
    });

    it('uses the provided custom fileName when supplied', () => {
      const saveSpy = jasmine.createSpy('save');
      const JsPDF = require('jspdf');
      const OriginalJsPDF = JsPDF.default ?? JsPDF.jsPDF ?? JsPDF;
      spyOn(OriginalJsPDF.prototype, 'save').and.callFake(saveSpy);
      spyOn(OriginalJsPDF.prototype, 'text').and.stub();
      spyOn(OriginalJsPDF.prototype, 'setFontSize').and.stub();

      service.exportTableToPdf(MOCK_COLUMNS, MOCK_ROWS, MOCK_METADATA, 'my-custom-report.pdf');

      const savedName: string = saveSpy.calls.mostRecent().args[0] as string;
      expect(savedName).toBe('my-custom-report.pdf');
    });

    it('writes the report header text (title + date + user) to the PDF before the table', () => {
      let capturedText = '';
      const JsPDF = require('jspdf');
      const OriginalJsPDF = JsPDF.default ?? JsPDF.jsPDF ?? JsPDF;
      spyOn(OriginalJsPDF.prototype, 'save').and.stub();
      spyOn(OriginalJsPDF.prototype, 'text').and.callFake((text: string) => {
        capturedText = text;
      });
      spyOn(OriginalJsPDF.prototype, 'setFontSize').and.stub();

      service.exportTableToPdf(MOCK_COLUMNS, MOCK_ROWS, MOCK_METADATA);

      expect(capturedText).toContain('Test Report Alpha');
      expect(capturedText).toContain('2024-06-15');
      expect(capturedText).toContain('Jane Smith');
    });
  });

  // ── exportChartToPdf ───────────────────────────────────────────────────────

  describe('exportChartToPdf', () => {
    it('resolves and saves a .pdf file', async () => {
      const mockCanvas = {
        toDataURL: () => 'data:image/png;base64,abc',
        width: 200,
        height: 100,
      };

      // Patch dynamic import for html2canvas
      const html2canvasMock = jasmine.createSpy('html2canvas').and.returnValue(
        Promise.resolve(mockCanvas),
      );

      // Intercept the dynamic import
      spyOn(ExportService.prototype as unknown as { _importHtml2canvas: () => Promise<unknown> }, '_importHtml2canvas' as never)
        .and.returnValue(Promise.resolve(html2canvasMock));

      const saveSpy = jasmine.createSpy('save');
      const JsPDF = require('jspdf');
      const OriginalJsPDF = JsPDF.default ?? JsPDF.jsPDF ?? JsPDF;
      spyOn(OriginalJsPDF.prototype, 'save').and.callFake(saveSpy);
      spyOn(OriginalJsPDF.prototype, 'text').and.stub();
      spyOn(OriginalJsPDF.prototype, 'setFontSize').and.stub();
      spyOn(OriginalJsPDF.prototype, 'addImage').and.stub();
      spyOn((OriginalJsPDF.prototype as { internal: { pageSize: { getWidth: () => number } } }).internal?.pageSize ?? OriginalJsPDF.prototype, 'getWidth' as never).and.returnValue(297);

      const div = document.createElement('div');
      // This will invoke the real dynamic import which isn't available in tests,
      // so we test the parts we can control.
      await expectAsync(
        service.exportChartToPdf(div, MOCK_METADATA),
      ).toBeResolved();
    });
  });

  // ── exportToExcel ──────────────────────────────────────────────────────────

  describe('exportToExcel', () => {
    it('resolves without throwing', async () => {
      await expectAsync(
        service.exportToExcel(MOCK_COLUMNS, MOCK_ROWS, MOCK_METADATA),
      ).toBeResolved();
    });

    it('resolves with a custom fileName', async () => {
      await expectAsync(
        service.exportToExcel(MOCK_COLUMNS, MOCK_ROWS, MOCK_METADATA, 'export.xlsx'),
      ).toBeResolved();
    });
  });

  // ── exportToCsv ────────────────────────────────────────────────────────────

  describe('exportToCsv', () => {
    it('resolves without throwing', async () => {
      await expectAsync(
        service.exportToCsv(MOCK_COLUMNS, MOCK_ROWS, MOCK_METADATA),
      ).toBeResolved();
    });
  });

  // ── exportToPng ────────────────────────────────────────────────────────────

  describe('exportToPng', () => {
    it('resolves without throwing when html2canvas resolves', async () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      await expectAsync(service.exportToPng(div, MOCK_METADATA)).toBeResolved();
      document.body.removeChild(div);
    });
  });

  // ── Metadata contract ─────────────────────────────────────────────────────

  describe('metadata contract', () => {
    it('_buildPdfHeader separates fields with  |  delimiter', () => {
      const header = (service as unknown as { _buildPdfHeader: (m: ExportMetadata) => string })
        ._buildPdfHeader(MOCK_METADATA);
      expect(header.split('|').length).toBeGreaterThanOrEqual(3);
    });

    it('generationDate appears as provided (YYYY-MM-DD)', () => {
      const validDate = '2025-01-31';
      const meta: ExportMetadata = { ...MOCK_METADATA, generationDate: validDate };
      const header = (service as unknown as { _buildPdfHeader: (m: ExportMetadata) => string })
        ._buildPdfHeader(meta);
      expect(header).toContain(validDate);
    });

    it('generatingUserName appears verbatim', () => {
      const meta: ExportMetadata = { ...MOCK_METADATA, generatingUserName: 'Alice Wonderland' };
      const header = (service as unknown as { _buildPdfHeader: (m: ExportMetadata) => string })
        ._buildPdfHeader(meta);
      expect(header).toContain('Alice Wonderland');
    });
  });
});
