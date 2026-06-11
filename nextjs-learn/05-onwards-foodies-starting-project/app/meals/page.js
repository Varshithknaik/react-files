import Link from 'next/link'
import MealsGrid from '@/components/meals/meal-grid'
import classes from './page.module.css'
import { getMeals } from '@/lib/meal'
import { Suspense } from 'react'

async function Meals() {
  const meals = await getMeals()
  return <MealsGrid meals={meals} />
}

export const metadata = {
  title: 'All Meals',
  description: 'Browse the delicious meals shared by our food community.',
}

export default async function MealsPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>
          Delicious meals, created{' '}
          <span className={classes.highlight}>by you</span>
        </h1>
        <p>Choose your favorite recipe and cook it yourself. Easy and fun!</p>
        <p className={classes.cta}>
          <Link href="/meals/share">Share Your Recipe</Link>
        </p>
      </header>
      <main className={classes.main}>
        <Suspense
          fallback={<p className={classes.loading}>Loading Meals...</p>}
        >
          <Meals />
        </Suspense>
      </main>
    </>
  )
}
