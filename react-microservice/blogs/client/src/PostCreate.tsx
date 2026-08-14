import axios from "axios"
import { useState } from "react"

export default function PostCreate() {
  const [ title , setTitle ] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await axios.post('http://localhost:4000/posts', { title })
    console.log(response.data)
    setTitle("")
  }
  return (
    <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="title">Title</label>
          <input className="form-control" id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit">Submit</button>
    </form>
  )
}
