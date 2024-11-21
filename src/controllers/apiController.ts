import express, { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { Usuario } from '../models/Usuario';
import { Notificacao } from '../models/Notificacao';

// Middleware para logs de auditoria
const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const logPath = path.join(__dirname, '..', 'logs', 'audit.log');
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}\n`;

    fs.appendFile(logPath, logMessage, (err) => {
        if (err) console.error('Erro ao gravar log de auditoria:', err);
    });

    next();
};

// Middleware de rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 100, // Limite de 100 requisições por IP
    message: 'Muitas requisições feitas pelo mesmo IP. Tente novamente mais tarde.',
    standardHeaders: true, // Retorna informações no header `RateLimit-*`
    legacyHeaders: false,  // Desativa headers `X-RateLimit-*`
});

// Aplicar middleware globalmente
const app = express();
app.use(limiter);
app.use(auditLogger);

// Rotas da API
export const ping = (req: Request, res: Response) => {
    res.json({ pong: true });
};

export const cadastrarUsuario = async (req: Request, res: Response) => {
    const { nome, email, senha, disciplina } = req.body;

    if (email && senha && nome && disciplina) {
        let usuarioExistente = await Usuario.findOne({ where: { email } });

        if (!usuarioExistente) {
            let novoUsuario = await Usuario.create({ email, senha, nome, disciplina });
            res.status(201).json({
                message: 'Usuário cadastrado com sucesso.',
                novoUsuario,
            });
        } else {
            res.status(400).json({ error: 'E-mail já existe.' });
        }
    } else {
        res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
    }
};

// Outras funções existentes (listarEmails, fazerLogin, etc.) continuam iguais.
// ...
