import type { BaseEntity } from './base';
import type { BloodType, EntityStatus, Gender, ISODate, ISODateTime } from './common';

/**
 * Consentimento LGPD — tipo condicional exigido pela BR-MIGRAR-004.
 *
 * `lgpd_consent: true` OBRIGA `lgpd_consent_date` e `lgpd_consent_ip`: o invariante
 * regulatório é verificado em compile-time, não em runtime.
 */
export type LGPDConsent =
  | {
      lgpd_consent: true;
      /** ISO datetime registrado automaticamente no save (BR-MIGRAR-004). */
      lgpd_consent_date: ISODateTime;
      /** IP registrado automaticamente no save (BR-MIGRAR-004). */
      lgpd_consent_ip: string;
    }
  | {
      lgpd_consent: false;
      lgpd_consent_date?: ISODateTime;
      lgpd_consent_ip?: string;
    };

/**
 * Paciente — espelho de `base44/entities/Patient.jsonc`.
 *
 * Obrigatórios: `full_name`, `cpf`, `birth_date`, `phone`, `lgpd_consent`
 * (BR-MIGRAR-003 — sem aceite o save é recusado).
 *
 * Sensíveis (LGPD): `cpf`, `birth_date` e o bloco `lgpd_consent*`.
 * O `cpf` é sempre criptografado no BaaS.
 */
export type Patient = BaseEntity &
  LGPDConsent & {
    full_name: string;
    /** Sensível — CPF (criptografado no BaaS). */
    cpf: string;
    /** Sensível — data de nascimento (`format: date`). */
    birth_date: ISODate;
    phone: string;
    gender?: Gender;
    email?: string;
    address?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    health_insurance?: string;
    insurance_number?: string;
    blood_type?: BloodType;
    allergies?: string;
    chronic_conditions?: string;
    medications_in_use?: string;
    photo_url?: string;
    notes?: string;
    /** Default `'ativo'` (BR-MIGRAR-005). */
    status?: EntityStatus;
  };
