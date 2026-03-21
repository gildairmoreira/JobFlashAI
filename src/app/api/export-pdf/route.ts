import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import prisma from "@/lib/prisma";

const isLocal = process.env.NODE_ENV === "development";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized. Please log in.", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return new NextResponse("Resume ID is required.", { status: 400 });
    }

    // Security check: ensure user owns the resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { userId: true },
    });

    if (!resume || resume.userId !== userId) {
      return new NextResponse("Unauthorized. You do not own this resume.", { status: 403 });
    }

    // PDF Secret for internal communication
    const secret = process.env.PDF_SECRET || "default_local_secret";
    
    // Construct the URL to the internal print page
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const printUrl = `${protocol}://${host}/print/${resumeId}?secret=${secret}`;

    // Configure Sparticuz for Netlify Serverless OR local Puppeteer
    let executablePath = null;
    if (isLocal) {
      executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // Fallback para Windows local
    } else {
      executablePath = await chromium.executablePath();
    }

    const browser = await puppeteer.launch({
      args: isLocal ? ["--no-sandbox", "--disable-setuid-sandbox"] : chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: executablePath || undefined,
      headless: true,
    });

    const page = await browser.newPage();
    
    // Set a timeout to prevent function from hanging indefinitely
    await page.goto(printUrl, { waitUntil: "networkidle2", timeout: 15000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    // Convert Uint8Array to a standard Buffer for NextResponse compatibility
    const responseBuffer = Buffer.from(pdfBuffer);

    return new NextResponse(responseBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="JobFlashAI_Resume_${resumeId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Export Error:", error);
    return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 });
  }
}
