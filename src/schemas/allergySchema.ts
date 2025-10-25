import z from 'zod'

export const allergySchema = z.object({
  type: z.string().min(1, 'Please select an allergy type'),
  pollen: z.string().min(1, 'Please select a specific pollen'),
  severity: z.string().min(1, 'Please select severity level'),
})

export type AllergyFormData = z.infer<typeof allergySchema>
