import React, { useState } from 'react';
import capitalize from 'lodash-es/capitalize';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ComboBox,
  ComposedModal,
  Form,
  FormGroup,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Select,
  SelectItem,
  Stack,
  TextInput,
} from '@carbon/react';
import { type TFunction, useTranslation } from 'react-i18next';
import { getCoreTranslation, type Location } from '@openmrs/esm-framework';
import { type BedAdministrationData } from './bed-administration-types';
import type { BedType, BedWithLocation } from '../types';
import styles from '../modals.scss';

/**
 * Adds translation for occupancy status options
 * t('occupancyStatusAvailable', 'Available')
 * t('occupancyStatusOccupied', 'Occupied')
 */

interface BedAdministrationFormProps {
  allLocations: Location[];
  availableBedTypes: Array<BedType>;
  handleCreateBed?: (formData: BedAdministrationData) => void;
  headerTitle: string;
  initialData: BedWithLocation;
  occupancyStatuses: string[];
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
}

interface ErrorType {
  message: string;
}

const createSchema = (t: TFunction) => {
  const numberInString = z.string().transform((val, ctx) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('invalidNumber', 'Please enter a valid number'),
      });
      return z.NEVER;
    }
    return val;
  });

  return z.object({
    bedId: z
      .string()
      .max(255)
      .refine((value) => value !== '', {
        message: t('invalidBedId', 'Bed ID cannot be empty'),
      }),
    bedRow: numberInString,
    bedColumn: numberInString,
    location: z.object({ display: z.string(), uuid: z.string() }).refine((value) => value.display != '', {
      message: t('invalidLocation', 'Please select a valid location'),
    }),
    occupancyStatus: z.string().refine((value) => value != '', {
      message: t('invalidOccupancyStatus', 'Please select a valid occupied status'),
    }),
    bedType: z.string().refine((value) => value != '', {
      message: t('invalidBedType', 'Please select a valid bed type'),
    }),
  });
};

const BedAdministrationForm: React.FC<BedAdministrationFormProps> = ({
  allLocations,
  availableBedTypes,
  handleCreateBed,
  headerTitle,
  initialData,
  occupancyStatuses,
  onModalChange,
  showModal,
}) => {
  const { t } = useTranslation();
  const [occupancyStatus, setOccupancyStatus] = useState(capitalize(initialData.status));
  const [selectedBedType] = useState(initialData.bedType?.name ?? '');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formStateError, setFormStateError] = useState('');

  const BedAdministrationSchema = createSchema(t);

  const {
    handleSubmit,
    control,
    formState: { isDirty },
    setValue,
  } = useForm<BedAdministrationData>({
    mode: 'all',
    resolver: zodResolver(BedAdministrationSchema),
    defaultValues: {
      bedColumn: initialData.column.toString() ?? '0',
      bedId: initialData.bedNumber ?? '',
      bedRow: initialData.row.toString() ?? '0',
      bedType: initialData.bedType?.name ?? '',
      location: initialData.location ?? {},
      occupancyStatus: capitalize(initialData.status) ?? occupancyStatus,
    },
  });

  const onSubmit = (formData: BedAdministrationData) => {
    const result = BedAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleCreateBed(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    // TODO: Port this over to the modal system or create individual modals for each form
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
      <ModalHeader className={styles.modalHeader} title={headerTitle} />
      <ModalBody hasScrollingContent>
        <Form>
          <Stack gap={3}>
            <FormGroup legendText={''}>
              <Controller
                name="bedId"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="bedId"
                      invalidText={fieldState.error?.message}
                      labelText={t('bedNumber', 'Bed number')}
                      placeholder={t('enterBedNumber', 'e.g. BMW-201')}
                      {...field}
                    />
                  </>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedRow"
                control={control}
                render={({ fieldState, field }) => (
                  <NumberInput
                    hideSteppers
                    id="bedRow"
                    invalidText={fieldState?.error?.message}
                    label={t('bedRow', 'Bed row')}
                    labelText={t('bedRow', 'Bed row')}
                    {...field}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedColumn"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    hideSteppers
                    id="bedColumn"
                    label={t('bedColumn', 'Bed column')}
                    labelText={t('bedColumn', 'Bed column')}
                    invalidText={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="location"
                control={control}
                render={({ fieldState, field: { onChange, onBlur, value, ref } }) => (
                  <ComboBox
                    aria-label={t('location', 'Location')}
                    id="location"
                    invalidText={fieldState?.error?.message}
                    items={allLocations}
                    itemToString={(location) => location?.display ?? ''}
                    label={t('location', 'Location')}
                    /*
                      TODO: onBlur shall be refactored to onBlur={onBlur} if esm-core has @carbon/react version 1.72+
                      (ComboBox bug does not trigger onChange below mentioned version in production build - see https://github.com/carbon-design-system/carbon/issues/18145#issuecomment-2521936772)
                    */
                    onBlur={(event) => {
                      const selectedLocation = allLocations.find((element) => element.display === event.target.value);
                      if (selectedLocation)
                        setValue('location', { display: selectedLocation.display, uuid: selectedLocation.uuid });
                      else setValue('location', { display: '', uuid: '' });
                      onBlur();
                    }}
                    onChange={({ selectedItem }) => onChange(selectedItem)}
                    placeholder={t('selectBedLocation', 'Select a bed location')}
                    ref={ref}
                    selectedItem={value}
                    titleText={t('bedLocation', 'Location')}
                    typeahead
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="occupancyStatus"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    defaultValue={occupancyStatus}
                    id="occupancyStatus"
                    invalidText={fieldState.error?.message}
                    labelText={t('occupancyStatus', 'Occupancy status')}
                    onChange={(event) => setOccupancyStatus(event.target.value)}
                    value={occupancyStatus}
                    {...field}>
                    <SelectItem text={t('chooseOccupiedStatus', 'Choose occupied status')} value="" />
                    {occupancyStatuses.map((occupancyStatus, index) => (
                      <SelectItem
                        key={`occupancyStatus-${index}`}
                        text={t(`occupancyStatus${occupancyStatus}`, `${occupancyStatus}`)}
                        value={occupancyStatus}
                      />
                    ))}
                  </Select>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedType"
                control={control}
                render={({ field }) => (
                  <Select
                    defaultValue={selectedBedType}
                    id="bedType"
                    invalidText={t('required', 'Required')}
                    labelText={t('bedTypes', 'Bed types')}
                    {...field}>
                    <SelectItem text={t('chooseBedtype', 'Choose a bed type')} />
                    {availableBedTypes.map((bedType, index) => (
                      <SelectItem text={bedType.name} value={bedType.name} key={`bedType-${index}`}>
                        {bedType.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </FormGroup>
            {showErrorNotification && (
              <InlineNotification
                kind="error"
                lowContrast
                onClose={() => setShowErrorNotification(false)}
                role="alert"
                style={{ minWidth: '100%', margin: '0', padding: '0' }}
                subtitle={formStateError}
                title={t('error', 'Error')}
              />
            )}
          </Stack>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button disabled={!isDirty} onClick={handleSubmit(onSubmit, onError)}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default BedAdministrationForm;
