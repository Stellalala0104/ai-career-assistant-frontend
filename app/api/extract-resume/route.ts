import { createRequire } from "module";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type PdfParseResult = {
  text: string;
};

type PdfParseFunction = (
  buffer: Buffer,
  options?: Record<string, unknown>
) => Promise<PdfParseResult>;

function createError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getFileExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractTxt(buffer: Buffer) {
  return buffer.toString("utf-8");
}

async function extractPdf(buffer: Buffer) {
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as PdfParseFunction;
  const result = await pdfParse(buffer);

  return result.text;
}

async function extractDocx(buffer: Buffer) {
  const mammoth = await import("mammoth");

  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return createError("No resume file was uploaded.");
    }

    if (uploadedFile.size === 0) {
      return createError("The uploaded file is empty.");
    }

    if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
      return createError("File is too large. Please upload a file under 5MB.");
    }

    const fileName = uploadedFile.name;
    const extension = getFileExtension(fileName);
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (extension === "txt") {
      extractedText = await extractTxt(buffer);
    } else if (extension === "pdf") {
      extractedText = await extractPdf(buffer);
    } else if (extension === "docx") {
      extractedText = await extractDocx(buffer);
    } else {
      return createError(
        "Unsupported file type. Please upload a TXT, PDF, or DOCX file."
      );
    }

    const cleanedText = cleanExtractedText(extractedText);

    if (!cleanedText) {
      return createError(
        "No readable text could be extracted from this file. If this is a scanned PDF, please paste the resume text manually."
      );
    }

    return NextResponse.json({
      fileName,
      text: cleanedText,
    });
  } catch (error) {
    console.error("Resume extraction error details:", error);

    const message =
      error instanceof Error
        ? `Resume extraction failed: ${error.message}`
        : "Something went wrong while extracting resume text.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}