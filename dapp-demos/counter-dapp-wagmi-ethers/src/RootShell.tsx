// Src/RootShell.tsx
import { lazy, Suspense, useState, useEffect } from "react";
import "./App.css";

const loadWeb3Provider = () => import("./components/Web3Provider");
const loadApp = () => import("./App");

const Web3Provider = lazy(loadWeb3Provider);
const App = lazy(loadApp);

// Modified to mirror the exact DOM hierarchy of your master framework shell
function MainLoadingSpinner() {
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Counter Contract</h1>
      <h2 style={{ textAlign: "center" }}>(RainbowKit, Wagmi, and Ethers)</h2>
      
      {/* Replaced .shell-container with .app-shell to align with the active App card */}
      <div className="app-shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "300px", padding: "40px 24px" }}>
        <div className="spinner-element" />
        <p style={{
          marginTop: "20px",
          color: "var(--text-secondary)",
          fontSize: "1rem",
          fontWeight: 600,
          letterSpacing: "-0.01em"
        }}>
          Loading Counter Contract DApp...
        </p>
      </div>
    </>
  );
}

export default function RootShell() {
  const [initWeb3, setInitWeb3] = useState(false);

  useEffect(() => {
    const prefetchAndMount = async () => {
      try {
        await Promise.all([loadWeb3Provider(), loadApp()]);
        setInitWeb3(true);
      } catch (error) {
        console.error("Failed to load background Web3 dependencies:", error);
      }
    };

    void prefetchAndMount();
  }, []);

  if (!initWeb3) {
    return <MainLoadingSpinner />;
  }

  return (
    <Suspense fallback={<MainLoadingSpinner />}>
      <Web3Provider>
        <App />
      </Web3Provider>
    </Suspense>
  );
}

