const express = require("express");
const mariadb = require("mariadb");
const bcrypt = require("bcryptjs");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());
const port = process.env.PORT;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Harulog API",
      version: "1.0.0",
      description: "API documentation for Harulog project",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./server.js"],
};

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function validateEnv() {
  if (!process.env.DB_PASSWORD) {
    throw new Error("Environment variable DB_PASSWORD is missing.");
  }
}

async function checkConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Connected to the database!");

    const rows = await conn.query("SELECT 1 as result");
    console.log("Test query result:", rows);
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    if (conn) conn.release();
  }
}
async function defineSchema() {
  let conn;
  const dbName = process.env.DB_NAME;
  try {
    conn = await pool.getConnection();

    await conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await conn.query(`USE ${dbName}`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS diary (
        id INT AUTO_INCREMENT PRIMARY KEY comment 'id',
        image_data TEXT comment 'base64 이미지 데이터',
        content TEXT NOT NULL comment '내용',
        username VARCHAR(50) NOT NULL comment '닉네임',
        hashed_password CHAR(64) NOT NULL comment '비밀번호의 SHA-256 해시',
        salt CHAR(32) NOT NULL comment '비밀번호 해싱용 salt',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP comment '생성일시'
      )
    `);

    console.log("Database schema defined successfully!");
  } catch (err) {
    console.error("Error defining schema:", err);
  } finally {
    if (conn) conn.release();
  }
}

async function init() {
  validateEnv();
  await checkConnection();
  await defineSchema();
}

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

/**
 * @swagger
 * /diaries:
 *   get:
 *     summary: 모든 다이어리 항목 가져오기
 *     description: DB에서 모든 다이어리 항목을 가져옵니다.
 *     responses:
 *       200:
 *         description: 다이어리 항목 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: 다이어리 ID
 *                     example: 1
 *                   image_data:
 *                     type: string
 *                     description: 이미지 데이터 (Base64 인코딩)
 *                     example: "data:image/png;base64,iVBORw0KGgo..."
 *                   content:
 *                     type: string
 *                     description: 다이어리 내용
 *                     example: "오늘은 아주 멋진 날이었다!"
 *                   username:
 *                     type: string
 *                     description: 작성자 이름
 *                     example: "johndoe"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: 다이어리 생성 시간
 *                     example: "2023-11-24T10:00:00Z"
 */
app.get("/diaries", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, image_data, content, username, created_at FROM diary");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching diaries:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * @swagger
 * /diaries:
 *   post:
 *     summary: 새 다이어리 항목 생성
 *     description: 새로운 다이어리 항목을 DB에 추가합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image_data:
 *                 type: string
 *                 description: 이미지 데이터 (Base64 인코딩)
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *               content:
 *                 type: string
 *                 description: 다이어리 내용
 *                 example: "오늘은 멋진 날이었어요."
 *               username:
 *                 type: string
 *                 description: 작성자 이름
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *                 example: "mypassword123"
 *     responses:
 *       201:
 *         description: 다이어리 항목 생성 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                   example: "Diary entry created"
 *                 id:
 *                   type: integer
 *                   description: 생성된 다이어리 항목의 ID
 *                   example: 42
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Internal server error"
 */
app.post("/diaries", async (req, res) => {
  const { image_data, content, username, password } = req.body;
  let conn;
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    conn = await pool.getConnection();
    const result = await conn.query("INSERT INTO diary (image_data, content, username, hashed_password, salt) VALUES (?, ?, ?, ?, ?)", [image_data, content, username, hashedPassword, salt]);
    res.status(201).json({ message: "Diary entry created", id: Number(result.insertId) });
  } catch (err) {
    console.error("Error creating diary entry:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * @swagger
 * /diaries/{id}:
 *   delete:
 *     summary: 다이어리 항목 삭제
 *     description: 특정 ID를 가진 다이어리 항목을 삭제합니다. 삭제 전에 요청 본문에 제공된 비밀번호를 검증합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 삭제할 다이어리 항목의 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: 삭제하려는 다이어리 항목의 비밀번호
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: 다이어리 항목 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                   example: "Diary entry deleted"
 *       400:
 *         description: 비밀번호가 제공되지 않았거나 요청이 잘못됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Password is required"
 *       401:
 *         description: 비밀번호가 일치하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Invalid password"
 *       404:
 *         description: 해당 ID의 다이어리 항목을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Diary entry not found"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Internal server error"
 */
app.delete("/diaries/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();

    // 1. 삭제하려는 항목의 hashed_password와 salt 조회
    const rows = await conn.query("SELECT hashed_password FROM diary WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    const { hashed_password } = rows[0];

    // 2. 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, hashed_password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3. 비밀번호 검증 성공 시 삭제
    const result = await conn.query("DELETE FROM diary WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    res.status(200).json({ message: "Diary entry deleted" });
  } catch (err) {
    console.error("Error deleting diary entry:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * @swagger
 * /diaries/{id}:
 *   put:
 *     summary: 다이어리 항목 업데이트
 *     description: 특정 ID를 가진 다이어리 항목을 업데이트합니다. 업데이트 전에 요청 본문에 제공된 비밀번호를 검증합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 업데이트할 다이어리 항목의 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image_data:
 *                 type: string
 *                 description: 업데이트할 이미지 데이터 (Base64 인코딩)
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
 *               content:
 *                 type: string
 *                 description: 업데이트할 다이어리 내용
 *                 example: "오늘은 멋진 날이었어요."
 *               username:
 *                 type: string
 *                 description: 업데이트할 작성자 이름
 *                 example: "updated_username"
 *               password:
 *                 type: string
 *                 description: 해당 다이어리 항목의 비밀번호
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: 다이어리 항목 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                   example: "Diary entry updated"
 *       400:
 *         description: 요청 본문에 비밀번호가 누락되었거나 요청이 잘못됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Password is required"
 *       401:
 *         description: 비밀번호가 일치하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Invalid password"
 *       404:
 *         description: 해당 ID의 다이어리 항목을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Diary entry not found"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 오류 메시지
 *                   example: "Internal server error"
 */
app.put("/diaries/:id", async (req, res) => {
  const { id } = req.params;
  const { image_data, content, username, password } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();

    // 1. 수정하려는 항목의 hashed_password 조회
    const rows = await conn.query("SELECT hashed_password FROM diary WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    const { hashed_password } = rows[0];

    // 2. 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, hashed_password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3. 비밀번호 검증 성공 시 데이터 업데이트
    const result = await conn.query("UPDATE diary SET image_data = ?, content = ?, username = ? WHERE id = ?", [image_data, content, username, id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Diary entry not found" });
    } else {
      res.status(200).json({ message: "Diary entry updated" });
    }
  } catch (err) {
    console.error("Error updating diary entry:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) conn.release();
  }
});

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

init();
