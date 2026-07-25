// Top bar of the app: studio name on the left,
// logged-in user info + sign out on the right.
// Receives the session/profile and the sign-out handler via props.
function Header({ session, profile, onSignOut }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="brand-mark">ā </span>
        <span className="brand-name">Yoga Class Chania</span>
      </div>

      {/* Only show the user area when someone is logged in*/}
      {session && (
        <div className="header-user">
          <span className="user-email">
            {profile?.full_name || session.user.email}
            {profile?.role === "teacher" && " · δασκάλα"}
          </span>
          <button className="link-btn" onClick={onSignOut}>
            Αποσύνδεση
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
