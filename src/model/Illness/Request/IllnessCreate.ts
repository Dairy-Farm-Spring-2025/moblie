import { IllnessSeverity } from '../enums/IllnessSeverity';
import { InjectionSite } from '../enums/InjectionSite';

/**
 * Interface representing the details of a treatment administered to a cow.
 */
export interface TreatmentDetail {
  /**
   * The dosage amount of the treatment (e.g., in mL or mg).
   */
  dosage: number;

  /**
   * The site on the cow's body where the treatment was injected.
   */
  injectionSite: InjectionSite;

  /**
   * The date when the treatment was administered (in YYYY-MM-DD format).
   */
  date: string;

  /**
   * A description of the treatment or additional notes.
   */
  description: string;

  /**
   * The identifier of the vaccine or medication used.
   */
  vaccineId: number;
}

/**
 * Interface representing an illness report for a cow.
 */
export interface IllnessReportRequest {
  /**
   * A description of the symptoms observed in the cow.
   */
  symptoms: string;

  /**
   * The severity level of the illness.
   */
  severity: IllnessSeverity;

  /**
   * The prognosis or expected outcome for the cow's condition.
   */
  prognosis: string;

  /**
   * The identifier of the cow associated with this report.
   */
  cowId: number;

  /**
   * An array of treatment details associated with this illness report.
   */
  detail: TreatmentDetail[];
}
