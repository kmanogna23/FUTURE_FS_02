const express = require("express");
const cors = require("cors");

require("./db");

const leadRoutes = require("./routes/leads");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/leads", leadRoutes);

app.get("/", (req, res) => {
    res.send("Mini CRM Backend Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});