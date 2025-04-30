import { ThemeProvider, styled } from "styled-components";
import { lightTheme } from "./utils/Themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authentication from "./pages/Authentication";
import { useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Otp from "./pages/Otp";
import { Toaster } from "react-hot-toast";
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  overflow-x: hidden;
  overflow-y: hidden;
  transition: all 0.2s ease;
`;

function App() {
  // Fix: Using optional chaining to safely access state.user
  const userState = useSelector((state) => state?.user);
  const currentUser = userState?.currentUser;

  return (
    <ThemeProvider theme={lightTheme}>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: lightTheme.card,
              color: lightTheme.text_primary,
              border: `1px solid ${lightTheme.text_secondary + "20"}`,
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: lightTheme.green,
                secondary: "white",
              },
            },
            error: {
              iconTheme: {
                primary: lightTheme.red,
                secondary: "white",
              },
            },
          }}
        />
        {currentUser ? (
          <Container>
            <Navbar currentUser={currentUser} />
            <Routes>
              <Route path="/" exact element={<Dashboard />} />
              <Route path="/workouts" exact element={<Workouts />} />
              <Route path="/nutration" exact element={<Nutrition />} />
              <Route path="/otp" exact element={<Otp />} />
            </Routes>
          </Container>
        ) : (
          <Container>
            <Authentication />
          </Container>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
