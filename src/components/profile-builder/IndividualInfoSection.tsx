import { Button } from '@/components/ui/button';
import { FormField, FormSelect, FormRadioGroup } from './FormFields';
import { IndividualInfo, PROFESSIONAL_TYPES, US_STATES, MILITARY_BRANCHES } from '@/types/lhl234Profile';
import { Copy } from 'lucide-react';

interface IndividualInfoSectionProps {
  data: IndividualInfo;
  onChange: (field: keyof IndividualInfo, value: any) => void;
}

export function IndividualInfoSection({ data, onChange }: IndividualInfoSectionProps) {
  const copyHomeToCorrespondence = () => {
    onChange('correspondenceAddress', data.homeAddress);
    onChange('correspondenceCity', data.homeCity);
    onChange('correspondenceState', data.homeState);
    onChange('correspondencePostalCode', data.homePostalCode);
  };

  const showMilitaryFields = data.militaryService === 'Yes';
  const showVisaField = data.citizenship && data.citizenship !== 'United States';

  return (
    <div className="space-y-8">
      {/* Name Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Name Information</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormSelect
            label="Type of Professional"
            id="typeOfProfessional"
            value={data.typeOfProfessional}
            onChange={(v) => onChange('typeOfProfessional', v)}
            options={PROFESSIONAL_TYPES}
            tooltip="Select your primary professional credential type"
            required
          />
          {data.typeOfProfessional === 'Other' && (
            <FormField
              label="Please specify"
              id="otherProfessionalType"
              value={data.otherProfessionalType || ''}
              onChange={(v) => onChange('otherProfessionalType', v)}
              placeholder="Specify professional type"
              required
            />
          )}
          <FormField
            label="Last Name"
            id="lastName"
            value={data.lastName}
            onChange={(v) => onChange('lastName', v)}
            placeholder="Smith"
            tooltip="Legal last name as it appears on your professional license"
            required
            synced
          />
          <FormField
            label="First Name"
            id="firstName"
            value={data.firstName}
            onChange={(v) => onChange('firstName', v)}
            placeholder="Jane"
            required
            synced
          />
          <FormField
            label="Middle Name"
            id="middleName"
            value={data.middleName || ''}
            onChange={(v) => onChange('middleName', v)}
            placeholder="Marie"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FormSelect
            label="Suffix"
            id="suffix"
            value={data.suffix || ''}
            onChange={(v) => onChange('suffix', v)}
            options={[
              { value: 'Jr.', label: 'Jr.' },
              { value: 'Sr.', label: 'Sr.' },
              { value: 'II', label: 'II' },
              { value: 'III', label: 'III' },
              { value: 'IV', label: 'IV' },
            ]}
          />
          <FormField
            label="Maiden Name"
            id="maidenName"
            value={data.maidenName || ''}
            onChange={(v) => onChange('maidenName', v)}
            placeholder="Previous last name"
          />
          <FormField
            label="Maiden Name Years"
            id="maidenNameYears"
            value={data.maidenNameYears || ''}
            onChange={(v) => onChange('maidenNameYears', v)}
            placeholder="YYYY-YYYY"
            tooltip="Years you used this name (e.g., 2010-2015)"
          />
          <FormField
            label="Other Name"
            id="otherName"
            value={data.otherName || ''}
            onChange={(v) => onChange('otherName', v)}
            placeholder="Any other names used"
          />
        </div>
        {data.otherName && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-start-4">
              <FormField
                label="Years Associated (YYYY-YYYY)"
                id="otherNameYears"
                value={data.otherNameYears || ''}
                onChange={(v) => onChange('otherNameYears', v)}
                placeholder="YYYY-YYYY"
                tooltip="Years you used this other name"
              />
            </div>
          </div>
        )}
      </div>

      {/* Home Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Home Address</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Street Address"
            id="homeAddress"
            value={data.homeAddress}
            onChange={(v) => onChange('homeAddress', v)}
            placeholder="123 Main Street"
            required
            className="md:col-span-2"
          />
          <FormField
            label="City"
            id="homeCity"
            value={data.homeCity}
            onChange={(v) => onChange('homeCity', v)}
            placeholder="Houston"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="State"
              id="homeState"
              value={data.homeState}
              onChange={(v) => onChange('homeState', v)}
              options={US_STATES}
              required
            />
            <FormField
              label="ZIP Code"
              id="homePostalCode"
              value={data.homePostalCode}
              onChange={(v) => onChange('homePostalCode', v)}
              placeholder="77001"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            label="Home Phone"
            id="homePhone"
            value={data.homePhone}
            onChange={(v) => onChange('homePhone', v)}
            placeholder="(713) 555-0100"
            type="tel"
            required
          />
          <FormField
            label="Social Security Number"
            id="ssn"
            value={data.ssn}
            onChange={(v) => onChange('ssn', v)}
            placeholder="XXX-XX-XXXX"
            type="password"
            tooltip="Required for credentialing verification. Encrypted and secure."
            required
            secure
          />
          <FormRadioGroup
            label="Gender"
            id="gender"
            value={data.gender}
            onChange={(v) => onChange('gender', v)}
            options={[
              { value: 'Female', label: 'Female' },
              { value: 'Male', label: 'Male' },
            ]}
            required
          />
        </div>
      </div>

      {/* Correspondence Address */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold text-foreground">Correspondence Address</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.useDifferentCorrespondence}
                onChange={(e) => onChange('useDifferentCorrespondence', e.target.checked)}
                className="rounded"
              />
              Different from home address
            </label>
            {data.useDifferentCorrespondence && (
              <Button variant="outline" size="sm" onClick={copyHomeToCorrespondence}>
                <Copy className="mr-2 h-4 w-4" />
                Copy from Home
              </Button>
            )}
          </div>
        </div>
        {data.useDifferentCorrespondence && (
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Street Address"
              id="correspondenceAddress"
              value={data.correspondenceAddress || ''}
              onChange={(v) => onChange('correspondenceAddress', v)}
              placeholder="123 Office Street"
              className="md:col-span-2"
            />
            <FormField
              label="City"
              id="correspondenceCity"
              value={data.correspondenceCity || ''}
              onChange={(v) => onChange('correspondenceCity', v)}
              placeholder="Houston"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="State"
                id="correspondenceState"
                value={data.correspondenceState || ''}
                onChange={(v) => onChange('correspondenceState', v)}
                options={US_STATES}
              />
              <FormField
                label="ZIP Code"
                id="correspondencePostalCode"
                value={data.correspondencePostalCode || ''}
                onChange={(v) => onChange('correspondencePostalCode', v)}
                placeholder="77001"
              />
            </div>
            <FormField
              label="Phone"
              id="correspondencePhone"
              value={data.correspondencePhone || ''}
              onChange={(v) => onChange('correspondencePhone', v)}
              placeholder="(713) 555-0101"
              type="tel"
            />
            <FormField
              label="Fax"
              id="correspondenceFax"
              value={data.correspondenceFax || ''}
              onChange={(v) => onChange('correspondenceFax', v)}
              placeholder="(713) 555-0102"
              type="tel"
            />
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Additional Information</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Email"
            id="email"
            value={data.email}
            onChange={(v) => onChange('email', v)}
            placeholder="dr.smith@email.com"
            type="email"
            tooltip="Professional email address for correspondence"
            required
          />
          <FormField
            label="Date of Birth"
            id="dateOfBirth"
            value={data.dateOfBirth}
            onChange={(v) => onChange('dateOfBirth', v)}
            type="date"
            required
          />
          <FormField
            label="Place of Birth"
            id="placeOfBirth"
            value={data.placeOfBirth}
            onChange={(v) => onChange('placeOfBirth', v)}
            placeholder="City, State/Country"
            tooltip="City and state/country where you were born"
            required
          />
          <FormField
            label="Citizenship"
            id="citizenship"
            value={data.citizenship}
            onChange={(v) => onChange('citizenship', v)}
            placeholder="United States"
            required
          />
          {showVisaField && (
            <FormField
              label="Visa Number & Status"
              id="visaNumberStatus"
              value={data.visaNumberStatus || ''}
              onChange={(v) => onChange('visaNumberStatus', v)}
              placeholder="Visa details"
              tooltip="Required if not a US citizen"
              required
            />
          )}
          <FormRadioGroup
            label="Eligible to work in the US?"
            id="eligibleToWorkInUS"
            value={data.eligibleToWorkInUS}
            onChange={(v) => onChange('eligibleToWorkInUS', v)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
            ]}
            required
          />
        </div>
      </div>

      {/* Military Service */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Military Service</h3>
        <FormRadioGroup
          label="U.S. Military Service/Public Health?"
          id="militaryService"
          value={data.militaryService}
          onChange={(v) => onChange('militaryService', v)}
          options={[
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
          ]}
          required
        />
        {showMilitaryFields && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 bg-muted/30 rounded-lg">
            <FormField
              label="Service Dates - From"
              id="militaryDatesFrom"
              value={data.militaryDatesFrom || ''}
              onChange={(v) => onChange('militaryDatesFrom', v)}
              type="date"
              required
            />
            <FormField
              label="Service Dates - To"
              id="militaryDatesTo"
              value={data.militaryDatesTo || ''}
              onChange={(v) => onChange('militaryDatesTo', v)}
              type="date"
              required
            />
            <FormField
              label="Last Location"
              id="militaryLocation"
              value={data.militaryLocation || ''}
              onChange={(v) => onChange('militaryLocation', v)}
              placeholder="Base/Location"
              required
            />
            <FormSelect
              label="Branch of Service"
              id="militaryBranch"
              value={data.militaryBranch || ''}
              onChange={(v) => onChange('militaryBranch', v)}
              options={MILITARY_BRANCHES}
              required
            />
            {data.militaryBranch === 'Other' && (
              <FormField
                label="Please specify branch"
                id="otherMilitaryBranch"
                value={data.otherMilitaryBranch || ''}
                onChange={(v) => onChange('otherMilitaryBranch', v)}
                placeholder="Specify branch of service"
                required
              />
            )}
            <FormRadioGroup
              label="Currently on active or reserve duty?"
              id="militaryActiveDuty"
              value={data.militaryActiveDuty || ''}
              onChange={(v) => onChange('militaryActiveDuty', v)}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
              ]}
              required
              className="md:col-span-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
