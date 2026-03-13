export const ERROR_MESSAGES = {
  // General
  required: 'This field is required.',

  // Certification Upload
  fileFormat: 'Only PDF, JPG, and PNG files are accepted.',
  fileSize: 'File size must not exceed 5 MB.',
  expiryBeforeIssue: 'Expiry date must be after issue date.',

  // Assessment
  timeUp: "Time's up! Your test has been auto-submitted.",
  retakeCooldown: (hours: number, minutes: number) =>
    `You can retake this assessment in ${hours} hours ${minutes} minutes.`,
  assessmentNotAvailable: 'Assessment not available yet for this skill.',

  // Project
  projectNameRequired: 'Project name is required.',
  startAfterDeadline: 'Start date must be before deadline.',
  noSkillsAdded: 'Add at least one required skill to create a project.',
  duplicateProjectName: 'A project with this name already exists.',

  // Skill Profile
  duplicateSkill: 'This skill is already in your profile.',
  linkedSkillDelete: 'This skill is linked to an active project and cannot be deleted.',

  // Candidate Matching
  noCandidatesFound: 'No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training.',

  // Skill Framework (Admin)
  duplicateSkillInSubcategory: 'This skill already exists in this subcategory.',
  categoryHasLinkedSkills: 'Cannot delete: skills are linked to this category.',

  // Login
  invalidCredentials: 'Invalid email or password.',
} as const;
