import z from 'zod'

export const symptomSchema = z.object({
  type: z.string().min(1, 'Please select a symptom type'),
  severity: z.string().min(1, 'Please select severity level'),
  notes: z.string().optional(),
  date: z.string().min(1, 'Please select a date'),
})

export type SymptomFormData = z.infer<typeof symptomSchema>

export const symptomTypes = [
  { value: 'sneezing', label: 'Sneezing' },
  { value: 'runny_nose', label: 'Runny Nose' },
  { value: 'congestion', label: 'Nasal Congestion' },
  { value: 'itchy_eyes', label: 'Itchy Eyes' },
  { value: 'watery_eyes', label: 'Watery Eyes' },
  { value: 'itchy_throat', label: 'Itchy Throat' },
  { value: 'cough', label: 'Cough' },
  { value: 'wheezing', label: 'Wheezing' },
  { value: 'shortness_breath', label: 'Shortness of Breath' },
  { value: 'headache', label: 'Headache' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'skin_rash', label: 'Skin Rash' },
  { value: 'hives', label: 'Hives' },
  { value: 'swelling', label: 'Swelling' },
  { value: 'other', label: 'Other' },
] as const

export const severityLevels = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
] as const
