import Nav from "@/components/Nav";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="container">
        <div className="card" style={{padding:24}}>
          <h1 style={{margin:"0 0 8px", fontSize:34}}>Phase 6 (Clean)</h1>
          <p className="muted" style={{marginTop:0}}>
            Admin sets Razorpay plan IDs → Membership page uses them to create a subscription.
          </p>
          <ol className="muted" style={{lineHeight:1.9}}>
            <li>Go to <b>/signin</b> and login with ADMIN_EMAIL / ADMIN_PASSWORD from .env</li>
            <li>Go to <b>/admin/settings</b> and save plan IDs</li>
            <li>Go to <b>/membership</b> and click Join Basic / Join Pro</li>
          </ol>
        </div>
      </div>
    </>
  );
}
