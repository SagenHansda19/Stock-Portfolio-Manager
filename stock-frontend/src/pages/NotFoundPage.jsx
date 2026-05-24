import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
      <Link to="/" className="mt-4 inline-block rounded bg-slate-900 px-4 py-2 text-sm text-white">
        Go home
      </Link>
    </section>
  )
}

export default NotFoundPage
