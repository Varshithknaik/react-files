'use server'

import { redirect } from 'next/navigation'
import { saveMeal } from './meal'

export async function shareMeal(formData) {
  const meal = {
    title: formData.get('title'),
    summary: formData.get('summary'),
    instructions: formData.get('instructions'),
    creator: formData.get('name'),
    creator_email: formData.get('email'),
    image: formData.get('image'),
  }
  await saveMeal(meal)
  redirect('/meals')
}
