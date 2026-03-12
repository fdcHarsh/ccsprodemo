import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { LHL234Profile } from '@/types/lhl234Profile';

/**
 * Attempts to load and fill the real LHL234 PDF template.
 * Falls back to generating a comprehensive LHL234-format PDF with jsPDF.
 */
export async function generateLHL234PDF(
  profile: LHL234Profile,
  options: { signed: boolean; signatureData?: string }
): Promise<void> {
  // Try to fill the real PDF template first
  try {
    const response = await fetch('/forms/lhl234.pdf');
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (fields.length > 0) {
      fillFormFields(form, profile);

      if (options.signed && options.signatureData) {
        const sigImage = await pdfDoc.embedPng(options.signatureData);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        lastPage.drawImage(sigImage, {
          x: 100,
          y: 80,
          width: 200,
          height: 75,
        });
      }

      form.flatten();
      const filledBytes = await pdfDoc.save();
      downloadBytes(
        filledBytes,
        `lhl234-${options.signed ? 'signed' : 'unsigned'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      );
      return;
    }
  } catch (e) {
    console.log('PDF form filling unavailable, generating comprehensive PDF');
  }

  // Fallback: generate a comprehensive LHL234-format PDF using jsPDF
  generateComprehensiveLHL234(profile, options);
}

// ─── Form Field Filling ─────────────────────────────────────────────────

function fillFormFields(form: any, profile: LHL234Profile) {
  const tryFill = (name: string, value: string) => {
    try {
      const field = form.getTextField(name);
      if (field && value) field.setText(value);
    } catch {}
  };

  const info = profile.individualInfo;
  tryFill('lastName', info.lastName);
  tryFill('firstName', info.firstName);
  tryFill('middleName', info.middleName || '');
  tryFill('homeAddress', info.homeAddress);
  tryFill('homeCity', info.homeCity);
  tryFill('homeState', info.homeState);
  tryFill('homePostalCode', info.homePostalCode);
  tryFill('homePhone', info.homePhone);
  tryFill('ssn', info.ssn);
  tryFill('email', info.email);
  tryFill('dateOfBirth', info.dateOfBirth);
  tryFill('placeOfBirth', info.placeOfBirth);
  tryFill('citizenship', info.citizenship);

  const lic = profile.licenses;
  if (lic.stateLicenses[0]) {
    tryFill('licenseNumber', lic.stateLicenses[0].licenseNumber);
    tryFill('licenseState', lic.stateLicenses[0].state);
  }
  tryFill('deaNumber', lic.deaRegistration.deaNumber);
  tryFill('npi', lic.providerNumbers.npi);

  tryFill('specialty', profile.specialtyInfo.primarySpecialty.specialty);
}

// ─── Comprehensive jsPDF Generation ─────────────────────────────────────

function generateComprehensiveLHL234(
  profile: LHL234Profile,
  options: { signed: boolean; signatureData?: string }
) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pw - margin * 2;
  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 25;
    }
  };

  const sectionHeader = (num: number | string, title: string) => {
    checkPage(20);
    doc.setFillColor(31, 71, 136);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${typeof num === 'number' ? `Section ${num}` : num} — ${title}`, margin + 4, y + 5.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 14;
  };

  const field = (label: string, value: string, inline = false) => {
    checkPage(10);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label.toUpperCase(), margin + 2, y);
    y += 3.5;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(value || '—', margin + 2, y);
    y += inline ? 5 : 7;
  };

  const fieldRow = (items: [string, string][]) => {
    checkPage(12);
    const colWidth = contentWidth / items.length;
    items.forEach(([label, value], i) => {
      const x = margin + i * colWidth;
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(label.toUpperCase(), x + 2, y);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(value || '—', x + 2, y + 4);
    });
    y += 10;
  };

  // ── Cover Page ──
  doc.setFillColor(31, 71, 136);
  doc.rect(0, 0, pw, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('TDI · Texas Department of Insurance', pw / 2, 20, { align: 'center' });
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Texas Standardized Credentialing', pw / 2, 38, { align: 'center' });
  doc.text('Application (LHL234)', pw / 2, 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    'Pursuant to Texas Insurance Code § 1452.052',
    pw / 2,
    62,
    { align: 'center' }
  );

  doc.setTextColor(0, 0, 0);
  y = 90;
  const info = profile.individualInfo;
  const fullName = [info.firstName, info.middleName, info.lastName]
    .filter(Boolean)
    .join(' ');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(fullName || 'Provider Name', pw / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 8;
  doc.text(`NPI: ${profile.licenses.providerNumbers.npi || '—'}`, pw / 2, y, {
    align: 'center',
  });
  y += 6;
  doc.text(
    `Generated: ${format(new Date(), 'MMMM d, yyyy')}`,
    pw / 2,
    y,
    { align: 'center' }
  );

  // ── Section 1: Individual Information ──
  doc.addPage();
  y = 20;
  sectionHeader(1, 'Individual Information');
  fieldRow([
    ['Type of Professional', info.typeOfProfessional + (info.otherProfessionalType ? ` (${info.otherProfessionalType})` : '')],
    ['Gender', info.gender],
    ['Date of Birth', info.dateOfBirth],
  ]);
  fieldRow([
    ['Last Name', info.lastName],
    ['First Name', info.firstName],
    ['Middle / Suffix', `${info.middleName || ''} ${info.suffix || ''}`.trim()],
  ]);
  if (info.otherName) {
    fieldRow([
      ['Other Name', info.otherName],
      ['Years Associated', info.otherNameYears || '—'],
    ]);
  }
  field('Home Address', info.homeAddress);
  fieldRow([
    ['City', info.homeCity],
    ['State', info.homeState],
    ['Postal Code', info.homePostalCode],
  ]);
  fieldRow([
    ['Home Phone', info.homePhone],
    ['Email', info.email],
    ['SSN', info.ssn ? '***-**-' + info.ssn.slice(-4) : '—'],
  ]);
  fieldRow([
    ['Place of Birth', info.placeOfBirth],
    ['Citizenship', info.citizenship],
    ['Eligible to Work in US', info.eligibleToWorkInUS],
  ]);

  // ── Section 2: Education ──
  sectionHeader(2, 'Education');
  const deg = profile.education.professionalDegree;
  fieldRow([
    ['Degree Type', deg.degreeType],
    ['Degree', deg.degree],
  ]);
  field('Institution', deg.institution);
  fieldRow([
    ['City', deg.city],
    ['State', deg.state],
    ['Dates', `${deg.attendanceFrom} – ${deg.attendanceTo}`],
  ]);

  // Post-Graduate Education
  profile.education.postGraduateEducation.forEach((pg, i) => {
    checkPage(25);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Post-Graduate Education ${i + 1}`, margin + 2, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    fieldRow([
      ['Type', pg.types.join(', ')],
      ['Specialty', pg.specialty],
    ]);
    field('Institution', pg.institution);
    fieldRow([
      ['Dates', `${pg.attendanceFrom} – ${pg.attendanceTo}`],
      ['Completed', pg.programCompleted ? 'Yes' : 'No'],
    ]);
  });

  // Other Graduate Education (separate section per LHL234)
  if (profile.education.otherGraduateEducation.length > 0) {
    checkPage(15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Other Graduate-Level Education', margin + 2, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    profile.education.otherGraduateEducation.forEach((og, i) => {
      checkPage(20);
      field('Institution', og.institution);
      fieldRow([
        ['Degree', og.degree],
        ['Dates', `${og.attendanceFrom} – ${og.attendanceTo}`],
      ]);
    });
  }

  // ── Section 3: Licenses ──
  sectionHeader(3, 'Licenses & Certificates');
  profile.licenses.stateLicenses.forEach((lic, i) => {
    if (!lic.licenseNumber && i > 0) return;
    fieldRow([
      ['License Type', lic.licenseType],
      ['License Number', lic.licenseNumber],
      ['State', lic.state],
    ]);
    fieldRow([
      ['Issue Date', lic.issueDate],
      ['Expiration', lic.expirationDate],
      ['Currently Practice', lic.currentlyPractice],
    ]);
  });
  const dea = profile.licenses.deaRegistration;
  fieldRow([
    ['DEA Number', dea.deaNumber],
    ['Issue Date', dea.issueDate],
    ['Expiration', dea.expirationDate],
  ]);

  // DPS
  if (profile.licenses.dpsRegistration.dpsNumber) {
    fieldRow([
      ['DPS Number', profile.licenses.dpsRegistration.dpsNumber || '—'],
      ['Issue Date', profile.licenses.dpsRegistration.issueDate || '—'],
      ['Expiration', profile.licenses.dpsRegistration.expirationDate || '—'],
    ]);
  }

  // Other CDS Registrations
  if (profile.licenses.otherCDSRegistrations.length > 0) {
    checkPage(10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Other CDS Registrations', margin + 2, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    profile.licenses.otherCDSRegistrations.forEach((cds) => {
      fieldRow([
        ['Type', cds.type],
        ['Number', cds.number],
        ['State', cds.state],
      ]);
      fieldRow([
        ['Issue Date', cds.issueDate],
        ['Expiration', cds.expirationDate],
        ['Currently Practice', cds.currentlyPractice],
      ]);
    });
  }

  fieldRow([
    ['NPI', profile.licenses.providerNumbers.npi],
    ['UPIN', profile.licenses.providerNumbers.upin || '—'],
    ['ECFMG', profile.licenses.ecfmg.ecfmgNumber || 'N/A'],
  ]);

  // ── Section 4: Specialty ──
  sectionHeader(4, 'Professional / Specialty Information');
  const spec = profile.specialtyInfo.primarySpecialty;
  fieldRow([
    ['Primary Specialty', spec.specialty],
    ['Board Certified', spec.boardCertified],
    ['Certifying Board', spec.certifyingBoard || '—'],
  ]);
  if (profile.specialtyInfo.secondarySpecialty?.specialty) {
    fieldRow([
      ['Secondary Specialty', profile.specialtyInfo.secondarySpecialty.specialty],
      ['Board Certified', profile.specialtyInfo.secondarySpecialty.boardCertified],
    ]);
  }

  // ── Section 5: Work History ──
  sectionHeader(5, 'Work History');
  const curr = profile.workHistory.currentPractice;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Current Practice', margin + 2, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  field('Employer', curr.employerName);
  field('Address', `${curr.address}, ${curr.city}, ${curr.state} ${curr.postalCode}`);
  const endDateDisplay = curr.endDate ? curr.endDate : 'Present';
  fieldRow([
    ['Start Date', curr.startDate],
    ['End Date', endDateDisplay],
  ]);

  profile.workHistory.previousPractices.forEach((prev, i) => {
    if (!prev.employerName) return;
    checkPage(20);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Previous Practice ${i + 1}`, margin + 2, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    field('Employer', prev.employerName);
    fieldRow([
      ['From', prev.startDate],
      ['To', prev.endDate || '—'],
      ['Reason', prev.reasonForDiscontinuance || '—'],
    ]);
  });

  // ── Section 6: Hospital Affiliations ──
  sectionHeader(6, 'Hospital Affiliations');
  fieldRow([
    ['Has Hospital Privileges', profile.hospitalAffiliations.hasHospitalPrivileges],
    ['Admitting Arrangements', profile.hospitalAffiliations.admittingArrangements || '—'],
  ]);
  if (profile.hospitalAffiliations.primaryHospital) {
    const ph = profile.hospitalAffiliations.primaryHospital;
    field('Primary Hospital', ph.hospitalName);
    field('Address', `${ph.address}, ${ph.city}, ${ph.state} ${ph.postalCode}`);
  }

  // ── Section 7: References ──
  sectionHeader(7, 'Professional References');
  profile.references.references.slice(0, 3).forEach((ref, i) => {
    if (!ref.nameTitle) return;
    checkPage(15);
    fieldRow([
      [`Reference ${i + 1}`, ref.nameTitle],
      ['Phone', ref.phone],
      ['Email', ref.email || '—'],
    ]);
    field('Address', `${ref.address}, ${ref.city}, ${ref.state} ${ref.postalCode}`);
  });

  // ── Section 8: Liability Insurance ──
  sectionHeader(8, 'Professional Liability Insurance');
  const ins = profile.liabilityInsurance.currentInsurance;
  fieldRow([
    ['Carrier', ins.carrierName],
    ['Policy Number', ins.policyNumber],
  ]);
  fieldRow([
    ['Effective', ins.effectiveDate],
    ['Expiration', ins.expirationDate],
    ['Type', ins.coverageType],
  ]);
  fieldRow([
    ['Per Occurrence', ins.coveragePerOccurrence],
    ['Aggregate', ins.coverageAggregate],
  ]);

  // ── Section 9: Call Coverage ──
  sectionHeader(9, 'Call Coverage');
  if (profile.callCoverage.callCoverageColleagues.length > 0) {
    profile.callCoverage.callCoverageColleagues.forEach((col) => {
      fieldRow([
        ['Colleague', col.name],
        ['Specialty', col.specialty],
      ]);
    });
  } else {
    field('Call Coverage', profile.callCoverage.useAttachedList ? 'See attached list' : 'Not specified');
  }

  // ── Section 10: Practice Locations ──
  if (profile.practiceLocations.length > 0) {
    profile.practiceLocations.forEach((loc, i) => {
      if (i === 0) {
        sectionHeader(10, 'Practice Location Information');
      } else {
        sectionHeader('Attachment F', `Additional Practice Location ${i + 1}`);
      }
      checkPage(20);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Location ${i + 1}${loc.isPrimary ? ' (Primary)' : ''}`,
        margin + 2,
        y
      );
      doc.setFont('helvetica', 'normal');
      y += 5;
      field('Practice Name', loc.practiceNameForDirectory);
      field('Address', `${loc.address}, ${loc.city}, ${loc.state} ${loc.postalCode}`);
      fieldRow([
        ['Phone', loc.phone],
        ['Tax ID', loc.taxId],
        ['Medicaid #', loc.medicaidNumber || '—'],
      ]);
      if (loc.phoneCoverage) {
        field('Phone Coverage', loc.phoneCoverage);
      }
      // Patient Acceptance
      const pa = loc.patientAcceptance;
      const accepts: string[] = [];
      if (pa.allNewPatients) accepts.push('All new patients');
      if (pa.existingWithPayorChange) accepts.push('Existing with payor change');
      if (pa.newWithReferral) accepts.push('New with referral');
      if (pa.newMedicare) accepts.push('New Medicare');
      if (pa.newMedicaid) accepts.push('New Medicaid');
      if (pa.variesByPlan) accepts.push('Varies by plan');
      if (accepts.length > 0) {
        field('Patient Acceptance', accepts.join(', '));
      }
      // Practice Restrictions
      const pr = loc.practiceRestrictions;
      const restrictions: string[] = [];
      if (pr.maleOnly) restrictions.push('Male only');
      if (pr.femaleOnly) restrictions.push('Female only');
      if (pr.ageRestrictions) restrictions.push(`Age: ${pr.ageRestrictionsDetails || 'Yes'}`);
      if (pr.other) restrictions.push(pr.otherDetails || 'Other');
      if (restrictions.length > 0) {
        field('Practice Restrictions', restrictions.join(', '));
      }
      // Non-Physician Providers
      if (loc.hasNonPhysicianProviders === 'Yes' && loc.nonPhysicianProviders.length > 0) {
        checkPage(10);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Non-Physician Providers', margin + 2, y);
        doc.setFont('helvetica', 'normal');
        y += 5;
        loc.nonPhysicianProviders.forEach((np) => {
          fieldRow([
            ['Name', np.name],
            ['Designation', np.designation],
            ['License', np.stateLicenseNo],
          ]);
        });
      }
    });
  }

  // ── Section 11: Disclosures ──
  sectionHeader(11, 'Disclosure Questions');
  profile.disclosures.questions.forEach((q) => {
    checkPage(10);
    doc.setFontSize(8);
    doc.text(
      `${q.questionNumber}. ${q.questionText.substring(0, 90)}${q.questionText.length > 90 ? '...' : ''}`,
      margin + 2,
      y,
      { maxWidth: contentWidth - 30 }
    );
    const lines = doc.splitTextToSize(
      `${q.questionNumber}. ${q.questionText.substring(0, 90)}`,
      contentWidth - 30
    );
    y += lines.length * 3.5 + 1;
    doc.setFont('helvetica', 'bold');
    doc.text(`Answer: ${q.answer || '—'}`, margin + 2, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    if (q.explanation) {
      doc.setFontSize(7);
      doc.text(`Explanation: ${q.explanation}`, margin + 4, y, {
        maxWidth: contentWidth - 10,
      });
      y += 6;
    }
  });

  // ── Section III: Authorization & Signature (before attachments) ──
  const att = profile.attestation;
  if (att) {
    doc.addPage();
    y = 20;
    sectionHeader('Section III', 'Authorization, Attestation and Release');
    if (att.applyingEntities) {
      field('Applying to', att.applyingEntities);
    }
    fieldRow([
      ['Initials', att.initialsPage11 || '—'],
      ['Initials Date', att.initialsDate || '—'],
    ]);
    fieldRow([
      ['Signature', att.signature || '—'],
      ['Printed Name', att.printedName || '—'],
    ]);
    fieldRow([
      ['Last 4 SSN/NPI', att.last4SsnOrNpi || '—'],
      ['Signature Date', att.signatureDate || '—'],
    ]);
  }

  // ── Signature Page ──
  doc.addPage();
  y = 30;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Attestation & Signature', pw / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  y += 15;
  doc.setFontSize(9);
  const attestation = `I hereby certify that all information provided in this application is true, correct, and complete to the best of my knowledge. I understand that any misstatement or omission may constitute grounds for denial or termination of credentialing.`;
  const attestLines = doc.splitTextToSize(attestation, contentWidth);
  doc.text(attestLines, margin, y);
  y += attestLines.length * 5 + 10;

  doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, margin, y);
  y += 15;

  if (options.signed && options.signatureData) {
    doc.text('Signature:', margin, y);
    y += 5;
    doc.addImage(options.signatureData, 'PNG', margin, y, 80, 30);
  } else {
    doc.text('Signature: _________________________________', margin, y);
  }

  // Save
  const filename = `lhl234-application-${options.signed ? 'signed' : 'unsigned'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

// ─── Utility ──────────────────────────────────────────────────────────────

function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
