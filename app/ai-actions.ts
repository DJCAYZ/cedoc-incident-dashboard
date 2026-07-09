"use server";

import { getEventReportData } from "./actions";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";

export async function generateWordReport(sessionId: number): Promise<string> {
    // 1. Fetch fresh data
    const data = await getEventReportData(sessionId);

    // 2. Construct the prompt
    const totalDead = data.incidents.reduce((acc, i) => acc + i.casualties_dead, 0);
    const totalInjured = data.incidents.reduce((acc, i) => acc + i.casualties_injured, 0);
    const totalEvacuated = data.incidents.reduce((acc, i) => acc + i.evacuated_families, 0);
    const totalPersonnel = data.personnel.reduce((acc, p) => acc + p.deployed, 0);
    const totalVehicles = data.vehicles.reduce((acc, v) => acc + v.active, 0);

    const incidentBreakdown = data.incidents.length > 0
        ? data.incidents.map((inc, idx) =>
            `${idx + 1}. Type: ${inc.type} | Location: ${inc.location}, ${inc.barangay} | Severity: ${inc.severity} | Status: ${inc.status} | Dead: ${inc.casualties_dead} | Injured: ${inc.casualties_injured} | Families Evacuated: ${inc.evacuated_families}`
        ).join("\n")
        : "No incidents reported for this session.";

    const prompt = `You are a professional Command Center AI Assistant generating an Executive Situation Report (SITREP) for senior decision-makers. The report will be printed and archived, so it must read as a finished, authoritative government or emergency-management document.

<instructions>
- Write in a formal, precise, neutral command-center tone. Do not editorialize, dramatize, or speculate beyond the data given.
- Structure the report with these exact section headers, in this order: SITUATION OVERVIEW, KEY METRICS, INCIDENT SUMMARY, RESOURCE DEPLOYMENT, ASSESSMENT.
- KEY METRICS must be bullet points. All other sections must be full prose paragraphs, not bullets.
- Every incident listed in the incident_breakdown data must be individually addressed in INCIDENT SUMMARY, by type, location, severity, and status. Do not merge, omit, or summarize incidents away. Do not invent details not present in the data (no fabricated names, causes, or times).
- Cross-check every sentence you write against the metrics block before finalizing. Do not describe injuries, deaths, or evacuations as occurring, ongoing, or being managed if the corresponding metric is zero. If casualty or evacuation totals are zero, state that response operations have not resulted in recorded casualties or evacuations to date, rather than omitting the point or implying otherwise.
- If a metric is zero, or there are no incidents, state that plainly and factually. Do not pad with filler sentences to compensate for a lack of data.
- Do not use em dashes, en dashes as sentence breaks, or double hyphens. Use commas, periods, or semicolons instead.
- Do not use vague hedging language such as "appears to," "seems to," or "may indicate." State only what the data supports, directly.
- Do not repeat the same fact in more than one section.
- Target length: 250-350 words. Favor completeness and precision over brevity if the incident count is high; every incident must still get a proper mention.
- Output ONLY the finished report text. No preamble, no notes to the user, no markdown code fences, no closing remarks outside the report itself.
</instructions>

<event_details>
Event Name: ${data.session.name}
Status: ${data.session.status}
Report Generated: ${new Date().toISOString()}
</event_details>

<metrics>
Total Incidents: ${data.incidents.length}
Total Personnel Deployed: ${totalPersonnel}
Total Vehicles Active: ${totalVehicles}
Total Casualties (Dead): ${totalDead}
Total Casualties (Injured): ${totalInjured}
Total Families Evacuated: ${totalEvacuated}
</metrics>

<incident_breakdown>
${incidentBreakdown}
</incident_breakdown>
`;

    // 3. Call Ollama
    let aiText = "";
    try {
        const response = await fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gemma4",
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.25,
                    top_p: 0.9,
                    num_predict: 2048
                }
            })
        });

        if (!response.ok) {
            console.error("Ollama error:", await response.text());
            throw new Error("Failed to connect to local Ollama (gemma4). Make sure Ollama is running.");
        }

        const result = await response.json();
        // Safety net: strip any em dashes / en dashes the model produces despite instructions.
        aiText = (result.response as string).replace(/[\u2014\u2013]/g, ",");
    } catch (e) {
        console.error("AI Generation failed", e);
        throw new Error("Failed to generate AI report. Is Ollama running on your PC with the 'gemma4' model installed?");
    }

    // 4. Generate the DOCX file (TAGLESS ARCHITECTURE)
    try {
        const templatePath = path.resolve(process.cwd(), "docs/Header Document Template.docx");
        const content = await fs.readFile(templatePath);

        const zip = new PizZip(content);

        // Anti-Repetition Protocol: We are abandoning docxtemplater tags because they are fragile.
        // Instead, we will directly append the AI report XML to the end of the document body.
        const docXmlFile = zip.file("word/document.xml");
        if (!docXmlFile) throw new Error("Invalid Word template: document.xml not found");
        let xml = docXmlFile.asText();

        // Escape special XML characters in the AI text
        const escapeXml = (unsafe: string) => {
            return unsafe.replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                    default: return c;
                }
            });
        };

        // Convert the AI text into Word XML Paragraphs
        const aiParagraphs = aiText.split('\n').map(line => {
            // Fix: Self-closing <w:p/> can silently crash Microsoft Word's XML parser mid-document.
            // Always render a full paragraph block, even for empty lines, to ensure structural integrity.
            if (!line.trim()) return '<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>';
            return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`;
        }).join('');

        // Append right before the closing body tag
        xml = xml.replace('</w:body>', aiParagraphs + '</w:body>');

        // Save the modified XML back into the zip
        zip.file("word/document.xml", xml);

        const buf = zip.generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        // Return base64 to the client so it can be downloaded
        return buf.toString("base64");
    } catch (e: any) {
        console.error("Docx generation failed", e);
        throw new Error("Failed to generate Word document using the template. Ensure 'docs/Header Document Template.docx' exists.");
    }
}