const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
    credential: admin.credential.cert(require("./firebase-admin.json")),
});

const messaging = admin.messaging();

app.post("/send-notification", async (req, res) => {
    const { token, title, body } = req.body;

    try {
        await messaging.send({
            token,
            notification: { title, body },
        });
        res.status(200).send("Notis skickad!");
    } catch (error) {
        res.status(500).send("Fel vid skickning av notis: " + error);
    }
});

app.listen(3001, () => console.log("Servern körs på port 3001"));
