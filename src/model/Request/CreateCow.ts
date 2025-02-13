export interface CreateCowModel {
  cowStatus: string; // Milking Cow, Dry Cow, etc.
  dateOfBirth: string; // Date in string format (e.g., '2025-02-13')
  dateOfEnter: string; // Date in string format (e.g., '2025-02-13')
  cowOrigin: string; // European, Indian, etc.
  gender: string; // Female, Male
  cowTypeId: number; // Cow type ID as a number
  description: string; // Description of the cow
}
