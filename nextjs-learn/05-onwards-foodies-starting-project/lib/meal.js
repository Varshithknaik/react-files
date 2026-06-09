import sql from 'better-sqlite3'
import slugify from 'slugify'
import xss from 'xss'
import fs from 'node:fs'

const db = sql('meals.db')

export async function getMeals() {
  return db.prepare('select * from meals').all()
}

export async function getMeal(slug) {
  return db.prepare('select * from meals where slug = $slug').get({ slug })
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true })
  meal.instruction = xss(meal.instructions)

  const extention = meal.image.name.split('.').pop()
  const randomName = Math.random().toString(36).substring(7)
  const filename = `${meal.slug}-${randomName}.${extention}`

  const stream = fs.createWriteStream(`public/images/${filename}`)

  const bufferedImage = await meal.image.arrayBuffer()

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error('Saving image failed!')
    }
  })

  meal.image = `/images/${filename}`

  db.prepare(
    `INSERT INTO meals (title , summary , instructions, creator , creator_email , slug , image ) VALUES
    (@title , @summary , @instructions , @creator , @creator_email , @slug , @image)`
  ).run(meal)
}
