import { useEffect } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Loader, SelectTheme } from "./components";
import { UserProvider } from "./contexts";
import { useAppStartup } from "./hooks";
import { DemoScreen, DemoScreen2, SalesOrderScreen } from "./screens";
import { setTheme } from "@ui5/webcomponents-base";

function App() {
  // ========== HOOKS
  const { isPending, user } = useAppStartup();

  // ========== EFFECTS
  useEffect(() => {
    if (!user) return;
    setTheme(user.themeId);
  }, [user]);

  // ========== VIEWS
  if (isPending) {
    return <Loader />;
  }

  return (
    <UserProvider value={{ user: user }}>
      <Router>
        {import.meta.env.DEV && <SelectTheme />}
        <nav style={{ display: "flex", gap: "1rem", padding: "0.5rem 1rem" }}>
          <Link to="/">Demo Screen</Link>
          <Link to="/demo2">Demo Screen 2</Link>
          <Link to="/sales-order">Sales Order</Link>
        </nav>
        <Routes>
          <Route path="/" element={<DemoScreen />} />
          <Route path="/demo2" element={<DemoScreen2 />} />
          <Route path="/sales-order" element={<SalesOrderScreen />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
