const express = require("express");
const axios = require("axios");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = process.env.PORT || 3000;

const OAUTH_CONSUMER_KEY = "SEU_CONSUMER_KEY"; // Substitua pela sua chave do FatSecret
const OAUTH_CONSUMER_SECRET = "SEU_CONSUMER_SECRET"; // Substitua pelo seu segredo do FatSecret
const BASE_URL = "https://platform.fatsecret.com/rest/server.api";

function generateSignature(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");

  const baseString = `GET&${encodeURIComponent(BASE_URL)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${OAUTH_CONSUMER_SECRET}&`;
  return CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);
}

app.get("/search", async (req, res) => {
  const { term } = req.query;
  if (!term) {
    return res.status(400).json({ error: "Termo de busca é obrigatório" });
  }

  const params = {
    method: "foods.search",
    search_expression: term,
    oauth_consumer_key: OAUTH_CONSUMER_KEY,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_version: "1.0",
  };

  params.oauth_signature = generateSignature(params);

  try {
    const response = await axios.get(BASE_URL, { params });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao acessar a API:", error);
    res.status(500).json({ error: "Erro ao acessar a API" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
