import { useEffect } from "react";
import { Loader, SelectTheme } from "./components";
import { UserProvider } from "./contexts";
import { useAppStartup } from "./hooks";
import { DemoScreen } from "./screens";
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
      {import.meta.env.DEV && <SelectTheme />}
      <DemoScreen />
    </UserProvider>
  );
}

export default App;
