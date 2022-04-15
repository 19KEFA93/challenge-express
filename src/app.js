var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
  clients: {},
  reset() {
    model.clients = {};
  },
  addAppointment(client, { date }) {
    !model.clients[client]
    ? model.clients[client] = new Array()
    : null;
    model.clients[client].push({ date, status: "pending" });
  },
  attend(client, date) {
    model.clients[client].map((el) =>
      el.date === date ? (el.status = "attended") : null
    );
  },
  cancel(client, date) {
    model.clients[client].map((el) =>
      el.date === date ? (el.status = "cancelled") : null
    );
  },
  erase(client, item) {
    
    item.includes(" ")
    ? ( //si tiene espacios, va a ser una fecha
      index = model.clients[client].findIndex(el => el.date === item),
      clientsErased = model.clients[client].splice(index,1)
    )
    : ( // si no, va a ser un status
      clientsErased = model.clients[client].filter(el => el.status === item),
      model.clients[client] = model.clients[client].filter(el => el.status !== item)
      );
    return  clientsErased
  },
  expire(client, date) {
    model.clients[client].map((el) =>
      el.date === date 
      ? (el.status = "expired") 
      : null
    );
  },
  getAppointments(client, state) {
    return state 
    ? model.clients[client].filter((el) => el.status === state)
    : model.clients[client];
  },
  getAppointmentsDate(client, date) {
    return date 
    ? model.clients[client].find((el) => el.date === date) 
    : null;
  },
  getClients() {
    return Object.getOwnPropertyNames(model.clients);
  },
};

server.use(bodyParser.json());

server.get("/api", (req, res) => {
  res.status(200).json(model.clients);
});

server.post("/api/Appointments", (req, res) => {
  let {client, appointment} = req.body;
  
  
  !client
  ? res.status(400).send("the body must have a client property")
  : typeof client !== "string"
  ? res.status(400).send("client must be a string")
  : (
  model.addAppointment(client, appointment),
  res.status(200).json(model.clients[client][0])
)  
});

server.get(`/api/Appointments/getAppointments/:name`, (req, res) =>{
  let {name} = req.params;
  let {status} = req.query;

  res.status(200).json(model.getAppointments(name, status))
});

server.get(`/api/Appointments/:name/erase`, (req, res) =>{
  let {name} = req.params;
  let clients = model.getClients();
  let {date} = req.query;

  !clients.includes(name)? res.status(400).send('the client does not exist')
  : res.json(model.erase(name, date))
});

server.get('/api/Appointments/:name', (req, res) =>{
  let {name} = req.params;
  let {date, option} = req.query;
  let clients = model.getClients();
  
  if (name === "clients") res.status(200).send(clients);
  else if(!clients.includes(name)) res.status(400).send("the client does not exist"); 
  else if (!model.getAppointmentsDate(name, date)) res.status(400).send("the client does not have a appointment for that date");
  else switch (option) {
    case 'attend':
      model.attend(name, date)
      res.status(200).json(model.getAppointmentsDate(name, date))
      break;
    case 'expire':
      model.expire(name, date)
      res.status(200).json(model.getAppointmentsDate(name, date))
      break;
    case 'cancel':
      model.cancel(name, date)
      res.status(200).json(model.getAppointmentsDate(name, date))
      break;
    default: res.status(400).send('the option must be attend, expire or cancel')

      break;
  }

});

server.listen(3000);
module.exports = { model, server };
