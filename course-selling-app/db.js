import mongoose from 'mongoose'

export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.model('User', userSchema)

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

export const Course = mongoose.model('Course', courseSchema)
