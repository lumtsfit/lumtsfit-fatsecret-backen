const express = require("express");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const cors = require("cors"); // Importa o pacote CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir acesso de qualquer origem
app.use(cors());

// Suas credenciais do FatSecret
const OAUTH_CONSUMER_KEY = "d7942796961247c494f2150499854712";
const OAUTH_CONSUMER_SECRET = "bc73b0b71f6544fdb837eae3276c763c";
const BASE_URL = "https://platform.fatsecret.com/rest/server.api";

// Função para gerar assinatura OAuth
function generateSignature(params) {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");

    const baseString = `GET&${encodeURIComponent(BASE_URL)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${OAUTH_CONSUMER_SECRET}&`;
    return CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);
}

// Rota para buscar alimentos
app.get("/search", async (req, res) => {
    const { term } = req.query;
    if (!term) {
        return res.status(400).json({ error: "Termo de busca é obrigatório" });
    }

    const params = {
        method: "foods.search",
        search_expression: term,
        format: "json", // Força a API a retornar JSON
        oauth_consumer_key: OAUTH_CONSUMER_KEY,
        oauth_nonce: Math.random().toString(36).substring(2),
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_version: "1.0",
    };

    params.oauth_signature = generateSignature(params);

    try {
        const response = await axios.get(BASE_URL, { params });
        res.json(response.data); // Retorna o JSON recebido da API ao cliente
    } catch (error) {
        console.error("Erro ao acessar a API:", error);
        res.status(500).json({ error: "Erro ao acessar a API" });
    }
});

// Rota para a raiz
app.get("/", (req, res) => {
    res.send("Bem-vindo ao FatSecret Backend! Use a rota /search para buscar alimentos.");
});

// Inicializa o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
