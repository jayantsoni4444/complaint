// // voice.js
// import express from "express";
// import fetch from "node-fetch";
// import cors from "cors";

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Replace with your Narakeet API Key
// const API_KEY = "YOUR_NARAKEET_API_KEY";

// app.post("/api/voice", async (req, res) => {
//   try {
//     const { text } = req.body;

//     const response = await fetch("https://api.narakeet.com/v1/text-to-speech", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${API_KEY}`,
//       },
//       body: JSON.stringify({
//         text: text,
//         voice: "Harsh",
//         lang: "hi-IN",
//         format: "mp3",
//       }),
//     });

//     if (!response.ok) {
//       const error = await response.text();
//       return res.status(500).send(error);
//     }

//     const audioBuffer = await response.arrayBuffer();
//     res.set("Content-Type", "audio/mpeg");
//     res.send(Buffer.from(audioBuffer));
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });

// app.listen(3000, () => console.log("Server running on port 3000"));
