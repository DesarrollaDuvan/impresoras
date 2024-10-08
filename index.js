const express = require("express");
const mysql = require("mysql");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Se crea la conexion con la base datos
const conexion = mysql.createConnection({
  host: "localhost",
  database: "impresoras",
  user: "root",
  password: "",
});

try {
  conexion.connect();
  console.log("CONEXION EXITOSA");
} catch (error) {
  console.log("Error en la conexion con la base de datos", error);
}

module.exports = conexion;

app.get("/", (req, res) => {
  conexion.query("SELECT * FROM impresoras", (err, resbd) => {
    if (err) {
      console.log("error en la consulta de las impresoras");
      throw err;
    } else {
      console.log(resbd);
      res.render("impresoras", { datos: resbd });
    }
  });
});

app.get("/contadores", (req, res) => {
  conexion.query("SELECT * FROM impresoras", (err, resbd) => {
    if (err) {
      console.log("error en consulta general de impresoras");
      throw err;
    } else {
      res.render("contadores", { datos: resbd });
    }
  });
});

app.get("/facturas", (req, res) => {
  conexion.query("SELECT * FROM impresoras", (err, resbd) => {
    if (err) {
      throw err;
    } else {
      res.render("facturas", { datos: resbd });
    }
  });
});

app.post("/agregar-imp", (req, res) => {
  const modelo = req.body.modelo;
  const regional = req.body.regional;
  const ubicacion = req.body.ubicacion;
  const ip = req.body.ip;
  const observacion = req.body.observacion;

  conexion.query(
    "INSERT INTO impresoras SET ?",
    {
      modelo: modelo,
      regional: regional,
      ubicacion: ubicacion,
      ip: ip,
      observaciones: observacion,
    },
    (err, result) => {
      if (err) {
        console.log("Error al insertar la impresoras");
        throw err;
      } else {
        console.log("Se inserto correctamente la impresora");
        res.redirect("/");
      }
    }
  );
});

app.post("/contador", (req, res) => {
  const imp = req.body.impresora;
  const fec = req.body.date;
  const contb = req.body.contadorbn;
  const contc = req.body.constadorcol;

  conexion.query(
    "INSERT INTO contadores SET ?",
    {
      id: imp,
      fecha: fec,
      contadorcl: contb,
      contadorbn: contc,
    },
    (err) => {
      if (err) {
        throw err;
      } else {
        res.redirect("/contadores");
      }
    }
  );
});

app.post("/cons-fact", (req, res) => {
  const imp = req.body.impresora;
  const fec = req.body.fecha;

  conexion.query("SELECT * FROM contadores WHERE id = '" + imp + "'", (err, resp) => {
    if (err) {
      console.log("error en la consulta de facturas");
      throw err;
    }
    else {
      console.log("Esta es la respuesta del facturas ", resp);
      res.redirect("/facturas");
    }
  })

})
//se establece el puerto por donde se va a ejecutar el proyecto
const PORT = 3000;
app.listen(PORT, console.log("El servidor esta corriendo Exitosamente"));
