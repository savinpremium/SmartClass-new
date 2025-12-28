
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSystemInsights = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following school management system data and provide a concise strategic summary (3 bullet points) for the System Owner. Data: ${JSON.stringify(data)}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate insights at this time.";
  }
};

export const generateStudentReportSummary = async (studentName: string, attendance: any[], payments: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a friendly 2-sentence performance summary for a student named ${studentName} based on these records: Attendance: ${JSON.stringify(attendance)}, Payments: ${JSON.stringify(payments)}`,
    });
    return response.text;
  } catch (error) {
    return "Student summary unavailable.";
  }
};
