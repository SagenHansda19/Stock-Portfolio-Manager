const AuthFormShell = ({ title, subtitle, children }) => {
  return (
    <section className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="rounded border bg-white p-5 shadow-sm">{children}</div>
    </section>
  )
}

export default AuthFormShell
