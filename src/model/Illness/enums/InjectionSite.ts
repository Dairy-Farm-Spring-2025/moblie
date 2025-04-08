/**
 * Enum representing the possible injection sites for administering treatments to a cow.
 */
export enum InjectionSite {
  /**
   * Injection site on the left arm (shoulder area) of the cow.
   */
  leftArm = 'leftArm',

  /**
   * Injection site on the right arm (shoulder area) of the cow.
   */
  rightArm = 'rightArm',

  /**
   * Injection site on the left thigh of the cow.
   */
  leftThigh = 'leftThigh',

  /**
   * Injection site on the right thigh of the cow.
   */
  rightThigh = 'rightThigh',

  /**
   * Injection site on the buttock (rear) area of the cow.
   */
  buttock = 'buttock',

  /**
   * Injection site in the abdominal area of the cow.
   */
  abdomen = 'abdomen',

  /**
   * Any other injection site not explicitly listed.
   */
  other = 'other',
}
