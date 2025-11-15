import React from "react";
import * as MUI from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import { useTheme as useAppTheme } from "../context/ThemeContext"; // ✅ wichtig!
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Caro from "./assets/bilder/Caro.jpg";
import Nana from "./assets/bilder/Nana.jpg";
import Crispy from "./assets/bilder/Crispy.jpg";
import Teilnehmer from "./assets/bilder/Teilnehmer.jpg";
import Übersicht from "./assets/bilder/Übersicht.jpg";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const { darkMode } = useAppTheme(); // ✅ DarkMode-Status aus Context
localStorage.removeItem("token"); // oder sessionStorage
  // ✅ Dynamisches MUI Theme (für Farben, Buttons etc.)
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#2e7d32",
      },
      background: {
        default: darkMode ? "#121212" : "#f9fafb",
        paper: darkMode ? "#1e1e1e" : "#fff",
      },
    },
  });
const getUserImage = () => {
    if (!user) return null;
    switch (user.username?.toLowerCase()) {
      case "caro":
        return Caro;
      case "nana":
        return Nana;
      case "crispy":
        return Crispy;
      default:
        return null;
    }
  };
  const userImage = getUserImage();


  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className={`min-h-screen flex flex-col items-center py-10 px-4 transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-green-50 text-green-800"
        }`}
      >
        {/* Titel */}
        <h1 className="text-3xl font-bold mb-8 text-center">
          Willkommen, {user.username}!
        </h1>

        {/* ✅ Grid Container für gleichgroße, responsive Karten */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          sx={{ width: "100%", maxWidth: "1100px" }}
        >
          {/* --- Card 1: Judging --- */}
          <Grid item xs={12} sm={6} md={4} display="flex">
            <Card
            sx={{
              flex: "1 1 300px",
              maxWidth: 345,
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              overflow: "hidden",
            }}
          >
            <CardMedia
              component="img"
              src={userImage || Crispy}
              alt={user.username}
              sx={{
                height: 160,
                objectFit: "cover",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Judging
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Hier geht’s zum Judging für Kostüm und Performance
              </Typography>
            </CardContent>

            <CardActions>
              <Button onClick={() => navigate("/costume")}>Kostüm</Button>
              <Button onClick={() => navigate("/performance")}>Auftritt</Button>
            </CardActions>
          </Card>
          </Grid>
          {/* --- Card 2: Teilnehmer --- */}
          <Grid item xs={12} sm={6} md={4} display="flex">
          <Card
            sx={{
              flex: "1 1 300px",
              maxWidth: 345,
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
            }}
            onClick={() => navigate("/teilnehmer")}
          >
            <CardActionArea>
              <CardMedia component="img" src={Teilnehmer} alt="Teilnehmer" />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Teilnehmer
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Hier geht’s zu den Teilnehmern
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button onClick={() => navigate("/teilnehmer")}>Teilnehmer</Button>
            </CardActions>
          </Card>
          </Grid>
          {/* --- Card 3: Übersicht --- */}
          <Grid item xs={12} sm={6} md={4} display="flex">
          <Card
            sx={{
              flex: "1 1 300px",
              maxWidth: 345,
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
            }}
            onClick={() => navigate("/übersicht")}
          >
            <CardActionArea>
              <CardMedia component="img" src={Übersicht} alt="Übersicht" />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Übersicht
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Zur Übersicht der vergebenen Punkte
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button onClick={() => navigate("/übersicht")}>Übersicht</Button>
            </CardActions>
          </Card>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}
