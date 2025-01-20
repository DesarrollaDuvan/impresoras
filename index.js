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
  console.log("esta consultando las facturas")
  const { impresora, desde, hasta } = req.body;

  // Convierte las fechas a formato de MySQL
  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);

  // Realizar la consulta para obtener los contadores de la impresora en el rango de fechas
  const cont = `
    SELECT * FROM contadores
    WHERE id = ? AND fecha BETWEEN ? AND ?
    ORDER BY fecha ASC
  `;

  console.log(fechaDesde)
  console.log(fechaHasta)


  conexion.query(cont, [impresora, fechaDesde, fechaHasta], (err, rows) => {
    if (err) {
      console.log("Error en la consulta de facturas");
      throw err;
    }

    // Si no hay resultados, mostrar un mensaje adecuado
    if (rows.length === 0) {
      return res.render("facturas", {
        mensaje: "No se encontraron datos para este rango de fechas.",
      });
    }

    // Calcular las copias realizadas en el rango de fechas
    let copiasTotales = 0;
    for (let i = 1; i < rows.length; i++) {
      const contadorAnterior = rows[i - 1];
      const contadorActual = rows[i];

      // Restamos los contadores para obtener las copias realizadas
      const copiasBN = contadorActual.contadorbn - contadorAnterior.contadorbn;
      const copiasColor = contadorActual.contadorcl - contadorAnterior.contadorcl;

      console.log(copiasBN)
      console.log(copiasColor)

      // Sumar las copias realizadas
      copiasTotales += copiasBN + copiasColor;

      const prec = `
    SELECT * FROM impresoras
    WHERE id = ?
  `;

      conexion.query(prec, [impresora], (err, resprec) => {
        if (err) {
          console.log("Error al consultar los precios de la impresora");
          throw err;
        }

        // Verificar si la consulta devolvió algún resultado
        if (resprec.length === 0) {
          console.log("No se encontró la impresora con el id proporcionado");
          return;
        }


        // Asegúrate de que los campos precio_bn y precio_color existan y sean números
        const precioBN = resprec[0].precio_bn;
        const precioCL = resprec[0].precio_color;

        // Imprimir los resultados para comprobar
        console.log("Precio de las impresoras BN: " + precioBN);
        console.log("Precio de las impresoras COLOR: " + precioCL);

      });
    }
    // Renderizar la página con los resultados
    res.redirect("/facturas");
    /* res.render("facturas", {
      copiasTotales: copiasTotales,
      impresoraId: impresora,
      desde: desde,
      hasta: hasta,
    }); */
  });
});

//se establece el puerto por donde se va a ejecutar el proyecto
const PORT = 3000;
app.listen(PORT, console.log("El servidor esta corriendo Exitosamente"));
