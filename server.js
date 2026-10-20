import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { GoogleGenAI }
from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai =
new GoogleGenAI({

    apiKey:
    process.env.GEMINI_API_KEY

});

function loadPrompt(topic){

    try{

        return fs.readFileSync(

            path.join(
                "prompts",
                `${topic}.txt`
            ),

            "utf8"

        );

    }

    catch{

        return `
Bạn là DigPhys AI.

Trả lời bằng tiếng Việt.

Giải thích dễ hiểu
cho học sinh THPT.
        `;

    }

}

app.get("/",(req,res)=>{

    res.json({

        success:true,

        message:
        "DigPhys AI Backend Running"

    });

});

app.post(
"/api/chat",
async (req,res)=>{

    try{

        const {
            topic,
            question,
            simulation
        } = req.body;

        const lessonPrompt =
        loadPrompt(topic);

        const prompt =
`
${lessonPrompt}

=====================

TRẠNG THÁI MÔ PHỎNG

${JSON.stringify(
simulation,
null,
2
)}

=====================

CÂU HỎI

${question}

=====================

YÊU CẦU

- Trả lời bằng tiếng Việt
- Không dùng Markdown
- Không dùng **
- Không dùng LaTeX
- Không dùng $$
- Viết công thức dạng văn bản thường
- Dễ hiểu cho học sinh THPT
`;

        const response =
        await ai.models.generateContent({

            model:
            "gemini-3.8-flash",

            contents:
            prompt

        });

        res.json({

            success:true,

            reply:
            response.text

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            reply:
            error.message

        });

    }

});

const PORT =
process.env.PORT || 3000;

app.listen(
PORT,
()=>{

console.log(`
=================================
 DigPhys AI Started
=================================
 URL:
 http://localhost:${PORT}
=================================
`);

});