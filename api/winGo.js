// api/winGo.js
export default async function handler(req, res) {
  try {
    const targetAPI = "https://okwin05.com/saas-api/lotterySg/lastSg?gameCode=WinGo_30S";

    const response = await fetch(targetAPI);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json(data);
  } catch (error) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: "Server error", details: error.toString() });
  }
}
