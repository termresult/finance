export default function SchoolPortal() {
  return (
    <div className="page-stack">
      <section className="stub-hero">
        <div>
          <img src="/brand/termresult-favicon.png" alt="TermResult" />
          <h2>School Portal</h2>
          <p>
            This route is reserved for subscribed schools to view invoices, download statements,
            and track reminder history. Admin tools ship first — the school experience plugs in here
            later without reshaping the app shell.
          </p>
          <div style={{ marginTop: 22 }}>
            <span className="chip">Route ready</span>
            <span className="chip" style={{ marginLeft: 8 }}>
              Auth & data pending
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
