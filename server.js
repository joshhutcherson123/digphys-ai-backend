import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import {
    GoogleGenerativeAI
} from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const genAI =
new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

/*
=========================
LOAD PROMPT
=========================
*/

function loadPrompt(topic){

    try{

        const promptPath =
        path.join(
            "prompts",
            `${topic}.txt`
        );

        return fs.readFileSync(
            promptPath,
            "utf8"
        );

    }

    catch(error){

        console.log(
            `Prompt not found: ${topic}`
        );

        return `
Bạn là DigPhys AI.

Trả lời bằng tiếng Việt.

Giải thích dễ hiểu
cho học sinh THPT.
        `;

    }

}

/*
=========================
ROOT
=========================
*/

app.get("/",(req,res)=>{

    res.json({

        success:true,

        message:
        "DigPhys AI Backend Running"

    });

});

/*
=========================
CHAT API
=========================
*/

app.post(
"/api/chat",
async (req,res)=>{

    try{

        const {
            topic,
            question,
            simulation
        }
        =
        req.body;

        const lessonPrompt =
        loadPrompt(
            topic
        );

        const finalPrompt =
`
${lessonPrompt}

-------------------------

TRẠNG THÁI MÔ PHỎNG:

${JSON.stringify(
    simulation,
    null,
    2
)}

-------------------------

CÂU HỎI:

${question}

-------------------------

YÊU CẦU:

- Trả lời bằng tiếng Việt.
- Ngắn gọn.
- Chính xác.
- Dễ hiểu.
- Nếu có công thức thì trình bày rõ.
`;

        const model =
        genAI.getGenerativeModel({

            model:
            "gemini-3.8-flash"

        });

        const result =
        await model.generateContent(
            finalPrompt
        );

        const reply =
        result.response.text();

        res.json({

            success:true,

            reply

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            reply:
            "Máy chủ DigPhys AI gặp lỗi."

        });

    }

});

/*
=========================
START SERVER
=========================
*/

const PORT =
process.env.PORT || 3000;

app.listen(
    PORT,
    ()=>{

        console.log(
`=================================
 DigPhys AI Started
=================================
 URL:
 http://localhost:${PORT}
=================================
`
        );

    }
);