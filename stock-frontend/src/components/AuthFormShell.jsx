const AuthFormShell = ({ title, subtitle, children }) => {
  return (
    <section className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {children}
      </div>
    </section>
  )
}

export default AuthFormShell
