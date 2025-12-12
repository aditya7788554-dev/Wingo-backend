export default async function handler(req, res) {
  try {
    const targetAPI = "https://okwin05.com/saas-api/lotterySsc/getSscHistory?lotteryCode=WinGo_30S&num=1";

    const response = await fetch(targetAPI, {
      headers: {
        "Accept": "application/json",
      }
    });

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json({
      success: true,
      source: "WinGo 30s",
      result: data
    });

  } catch (error) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({
      error: "Server error",
      details: error.toString()
    });
  }
}
