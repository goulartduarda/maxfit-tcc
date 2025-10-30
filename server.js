// ============================================================
//  server.js — API oficial MaxFit 💪
// ============================================================
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg"); // ✅ Import único e correto

const app = express();

// ============================================================
// 🔹 Configuração CORS (Netlify + local)
// ============================================================
app.use(cors({
  origin: [
    "https://cheerful-klepon-54ef0e.netlify.app", // front hospedado
    "http://localhost:5500" // opcional para testes locais
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ============================================================
// 🔹 Conexão com o banco Supabase (PostgreSQL via IPv4 e SSL)
// ============================================================
let db;

async function conectarBanco() {
  try {
    db = new Pool({
      host: "db.wmfefhqcgkpzujlnsklv.supabase.co",
      user: "postgres",
      password: "root", // senha configurada no Supabase
      database: "postgres",
      port: 5432,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      keepAlive: true,
    });

    await db.query("SELECT NOW()");
    console.log("✅ Conectado ao Supabase (PostgreSQL)");
  } catch (erro) {
    console.error("❌ Erro ao conectar ao Supabase:", erro);
    process.exit(1);
  }
}

conectarBanco();

// Middleware para garantir conexão ativa
app.use((req, res, next) => {
  if (!db) return res.status(500).json({ erro: "Banco não conectado." });
  next();
});


// ============================================================
// 🔹 LOGIN
// ============================================================
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT id, nome, email, tipo FROM usuarios WHERE email = ? AND senha = ?",
      [email, senha]
    );

    if (rows.length === 0)
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });

    const usuario = rows[0];
    console.log("✅ Login realizado:", usuario);
    res.json(usuario);
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

// ============================================================
// 🔹 LISTAR ALUNOS DISPONÍVEIS (sem personal vinculado)
// ============================================================
app.get("/api/alunos-disponiveis", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nome, email FROM usuarios WHERE tipo = 'aluno' AND (personal_id IS NULL OR personal_id = '')"
    );
    console.log(`📋 Alunos disponíveis: ${rows.length}`);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar alunos disponíveis:", err);
    res.status(500).json({ mensagem: "Erro ao buscar alunos disponíveis." });
  }
});

// ============================================================
// 🔹 LISTAR ALUNOS DO PERSONAL
// ============================================================
app.get("/api/alunos-do-personal/:idPersonal", async (req, res) => {
  const { idPersonal } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id, nome, email FROM usuarios WHERE tipo = 'aluno' AND personal_id = ?",
      [idPersonal]
    );
    console.log(`📋 Alunos do personal ${idPersonal}: ${rows.length}`);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar alunos do personal:", err);
    res.status(500).json({ mensagem: "Erro ao buscar alunos do personal." });
  }
});

// ============================================================
// 🔹 VINCULAR ALUNO AO PERSONAL
// ============================================================
app.put("/api/vincular-aluno", async (req, res) => {
  const { alunoId, personalId } = req.body;
  if (!alunoId || !personalId)
    return res.status(400).json({ mensagem: "Dados insuficientes." });

  try {
    await db.query(
      "UPDATE usuarios SET personal_id = ? WHERE id = ? AND tipo = 'aluno'",
      [personalId, alunoId]
    );
    console.log(`🤝 Aluno ${alunoId} vinculado ao personal ${personalId}`);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao vincular aluno:", err);
    res.status(500).json({ mensagem: "Erro ao vincular aluno." });
  }
});

// ============================================================
// 🔹 REMOVER ALUNO DO PERSONAL
// ============================================================
app.put("/api/remover-aluno/:idAluno", async (req, res) => {
  const { idAluno } = req.params;

  try {
    await db.query(
      "UPDATE usuarios SET personal_id = NULL WHERE id = ? AND tipo = 'aluno'",
      [idAluno]
    );
    console.log(`❌ Aluno ${idAluno} desvinculado do personal`);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao remover aluno:", err);
    res.status(500).json({ mensagem: "Erro ao remover aluno." });
  }
});
// ============================================================
// 🔹 CADASTRAR TREINO (versão compatível com seu banco)
// ============================================================
app.post("/api/treinos", async (req, res) => {
  const { aluno_id, personal_id, titulo, objetivo, nivel, validade, exercicios } = req.body;

  if (!aluno_id || !personal_id || !titulo || !Array.isArray(exercicios) || exercicios.length === 0) {
    return res.status(400).json({ mensagem: "Dados incompletos para criar treino." });
  }

  try {
    // cria o treino principal
    const [result] = await db.query(
      "INSERT INTO treinos (aluno_id, personal_id, titulo, objetivo, nivel, validade, criado_em) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [aluno_id, personal_id, titulo, objetivo, nivel, validade || null]
    );

    const treinoId = result.insertId;

    // grava os exercícios associados
    for (const ex of exercicios) {
      if (!ex.nome) continue;

      const series = ex.series || 0;
      const repeticoes = ex.repeticoes || 0;
      const descanso = ex.descanso || 0;

      await db.query(
        "INSERT INTO exercicios (treino_id, nome, series, repeticoes, descanso) VALUES (?, ?, ?, ?, ?)",
        [treinoId, ex.nome, series, repeticoes, descanso]
      );
    }

    console.log(`🏋️‍♂️ Novo treino criado: ${titulo} (ID ${treinoId}) para aluno ${aluno_id}`);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("❌ Erro ao cadastrar treino:", err.sqlMessage || err.message);
    res.status(500).json({ mensagem: "Erro ao cadastrar treino." });
  }
});
// ============================================================
// 🔹 LISTAR TREINOS DE UM ALUNO (compatível com seu banco atual)
// ============================================================
app.get("/api/treinos/:alunoId", async (req, res) => {
  const { alunoId } = req.params;

  try {
    // 1️⃣ Busca todos os treinos vinculados ao aluno
    const [treinos] = await db.query(
      "SELECT id, titulo, objetivo, nivel, validade FROM treinos WHERE aluno_id = ? ORDER BY id DESC",
      [alunoId]
    );

    if (treinos.length === 0) {
      console.log(`📭 Nenhum treino encontrado para aluno ${alunoId}`);
      return res.json([]);
    }

    // 2️⃣ Para cada treino, buscar os exercícios associados
    for (const treino of treinos) {
      const [exercicios] = await db.query(
        "SELECT nome, series, repeticoes, descanso, observacoes FROM exercicios WHERE treino_id = ?",
        [treino.id]
      );

      treino.exercicios = exercicios || [];
    }

    console.log(`✅ Treinos enviados para aluno ${alunoId}: ${treinos.length}`);
    res.json(treinos);
  } catch (err) {
    console.error("❌ Erro ao buscar treinos do aluno:", err.sqlMessage || err);
    res.status(500).json({ mensagem: "Erro ao buscar treinos do aluno." });
  }
});
// ====================== ROTAS DE PROGRESSO ======================
// 🔹 Buscar progresso de um aluno
app.get("/api/progresso/:alunoId", async (req, res) => {
  try {
    const { alunoId } = req.params;
    const [rows] = await db.execute(
      "SELECT id, data_registro, exercicio, peso, repeticoes, series, rpe, observacoes FROM progresso WHERE aluno_id = ? ORDER BY data_registro DESC",
      [alunoId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar progresso:", err);
    res.status(500).json({ erro: "Erro ao buscar progresso" });
  }
});

// 🔹 Cadastrar novo progresso
app.post("/api/progresso", async (req, res) => {
  try {
    const { aluno_id, data_registro, exercicio, peso, repeticoes, series, rpe, observacoes } = req.body;

    const [result] = await db.execute(
      "INSERT INTO progresso (aluno_id, data_registro, exercicio, peso, repeticoes, series, rpe, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [aluno_id, data_registro, exercicio, peso, repeticoes, series, rpe, observacoes]
    );

    res.json({ id: result.insertId, message: "Progresso salvo com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir progresso:", err);
    res.status(500).json({ erro: "Erro ao salvar progresso" });
  }
});

// 🔹 Atualizar progresso existente
app.put("/api/progresso/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { exercicio, peso, repeticoes, series, rpe, observacoes } = req.body;

    await db.execute(
      "UPDATE progresso SET exercicio=?, peso=?, repeticoes=?, series=?, rpe=?, observacoes=? WHERE id=?",
      [exercicio, peso, repeticoes, series, rpe, observacoes, id]
    );

    res.json({ message: "Progresso atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar progresso:", err);
    res.status(500).json({ erro: "Erro ao atualizar progresso" });
  }
});
// ==================== DESAFIOS ====================

// 🔹 Listar TODOS os desafios (para tela de Participar)
app.get('/api/desafios', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.nome AS nome_aluno
      FROM desafios d
      JOIN usuarios u ON d.aluno_id = u.id
      ORDER BY d.data_fim ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar todos os desafios:', err);
    res.status(500).json({ error: 'Erro ao listar todos os desafios' });
  }
});
// 🔹 Listar desafios de um aluno (criados ou que participa)
app.get('/api/desafios/:alunoId', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const [rows] = await db.query(`
      SELECT d.*, u.nome AS nome_aluno
      FROM desafios d
      JOIN usuarios u ON d.aluno_id = u.id
      WHERE d.aluno_id = ? 
         OR d.id IN (SELECT desafio_id FROM desafios_aluno WHERE aluno_id = ?)
      ORDER BY d.data_fim ASC
    `, [alunoId, alunoId]);
    
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar desafios do aluno:', err);
    res.status(500).json({ error: 'Erro ao buscar desafios do aluno' });
  }
});

// 🔹 Criar novo desafio
app.post('/api/desafios', async (req, res) => {
  try {
    const { titulo, descricao, data_fim, aluno_id } = req.body;

    if (!titulo || !descricao || !data_fim || !aluno_id) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const hoje = new Date().toISOString().slice(0, 10);
    await db.query(
      'INSERT INTO desafios (aluno_id, titulo, descricao, data_inicio, data_fim, status) VALUES (?, ?, ?, ?, ?, ?)',
      [aluno_id, titulo, descricao, hoje, data_fim, 'ativo']
    );

    res.json({ message: 'Desafio criado com sucesso!' });
  } catch (err) {
    console.error('Erro ao criar desafio:', err);
    res.status(500).json({ error: 'Erro ao criar desafio' });
  }
});

// 🔹 Marcar desafio como concluído
app.put('/api/desafios/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE desafios SET status = ? WHERE id = ?', ['concluido', id]);
    res.json({ message: 'Desafio concluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao concluir desafio:', err);
    res.status(500).json({ error: 'Erro ao concluir desafio' });
  }
});

// 🔹 Excluir desafio
app.delete('/api/desafios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM desafios WHERE id = ?', [id]);
    res.json({ message: 'Desafio excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir desafio:', err);
    res.status(500).json({ error: 'Erro ao excluir desafio' });
  }
});

// 🔹 Participar de um desafio
app.post('/api/desafios/:id/participar', async (req, res) => {
  try {
    const { id } = req.params;
    const { aluno_id } = req.body;

    if (!aluno_id) {
      return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
    }

    // Verifica se o aluno já participa
    const [exists] = await db.query(
      'SELECT * FROM desafios_aluno WHERE desafio_id = ? AND aluno_id = ?',
      [id, aluno_id]
    );

    if (exists.length > 0) {
      return res.status(400).json({ error: 'Aluno já participa deste desafio.' });
    }

    // Cadastra a participação
    await db.query(
      'INSERT INTO desafios_aluno (desafio_id, aluno_id, data_participacao) VALUES (?, ?, CURRENT_DATE)',
      [id, aluno_id]
    );

    res.json({ message: 'Participação registrada com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar participação:', err);
    res.status(500).json({ error: 'Erro ao registrar participação.' });
  }
});
// ==================== DIÁRIO DE TREINO ====================

// Listar entradas do diário de um aluno
app.get('/api/diarios/:alunoId', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM diarios WHERE aluno_id = ? ORDER BY data DESC`,
      [alunoId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar diário:', err);
    res.status(500).json({ error: 'Erro ao buscar diário' });
  }
});

// Registrar nova entrada no diário
app.post('/api/diarios', async (req, res) => {
  try {
    const { aluno_id, data, treino_executado, avaliacao, objetivo, feito_hoje, como_me_senti, imagem } = req.body;

    if (!aluno_id || !data || !treino_executado) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    await db.query(
      `INSERT INTO diarios (aluno_id, data, treino_executado, avaliacao, objetivo, feito_hoje, como_me_senti, imagem)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [aluno_id, data, treino_executado, avaliacao, objetivo, feito_hoje, como_me_senti, imagem || null]
    );

    res.json({ message: 'Entrada registrada com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar entrada:', err);
    res.status(500).json({ error: 'Erro ao registrar entrada' });
  }
});


// ============================================================
// 🔹 STATUS
// ============================================================
app.get("/", (req, res) => {
  res.send("✅ API MaxFit rodando e conectada ao banco!");
});

// ============================================================
// 🔹 Inicialização
// ============================================================

// Usa variável do Render se existir, senão 3000 localmente
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});


