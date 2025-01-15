import { z } from "zod";
import { OpenAI } from "openai";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../trpc";
import { translations as translationsDatabase } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI();

const zodDocumentType = z.enum([
    "Books, Academic Papers, and Technical Content",
    "News/Journalistic Writing",
    "Literary (Poetry or Prose)",
    "Legal",
]);

export type DocumentType = z.infer<typeof zodDocumentType>;

// Helper function to parse is_done tag
const parseIsDone = (responseText: string): boolean => {
    const match = /<is_done>(.*?)<\/is_done>/s.exec(responseText);
    return match ? match[1].trim().toLowerCase() === "yes" : false;
};

// Helper function to extract translation content
const extractTranslation = (responseText: string): string => {
    const match = /<translation>(.*?)<\/translation>/s.exec(responseText);
    return match ? match[1].trim() : "";
};

// Helper function to get system prompt based on document type
const getSystemPrompt = (documentType: DocumentType): string => {
    switch (documentType) {
        case "Books, Academic Papers, and Technical Content":
            return `### Translation and Formatting Guidelines:

#### 1. **General Translation Principles:**
- Translate into fluent, natural language that mirrors the tone and intent of the original, whether academic, journalistic, technical, or literary. 
- Maintain clarity for factual and academic sections, precision for technical terms, and elegance for reflective or literary passages.  
- Adapt expressions to resonate with the cultural and linguistic norms of the target audience.

#### 2. **Handling Specialized Terms:**
- **Academic Terms:** Use their accepted equivalents or transliterations, adapting where necessary for clarity.  
- **Technical Language:** Ensure accurate and precise translation for science, technology, or coding terms, following industry conventions in the target language.  
- **Literary Language:** Translate erudite sections using idiomatic and culturally appropriate phrases to preserve literary quality.  

#### 3. **Widely Recognized Terms:**  
- Retain widely understood terms (e.g., "AI," "quantum mechanics," "coding syntax") and transliterate or adapt them naturally in the target language.

#### 4. **Document Structure:**  
- Use appropriate headings and markdown to organize the text clearly, respecting conventions of the target language.  
- Translate captions, figures, and annotations alongside the main text for cohesive presentation.  

#### 5. **Non-Truncation Instructions:**  
- Do **not truncate** any output, even if the text is lengthy.  
- If the translation exceeds the length limit of a single response, break it into manageable parts.  
- Use the <is_done> XML tag to indicate the completion status of the translation:  
  - <is_done>No</is_done> if the translation is incomplete, signaling the need to continue.  
  - <is_done>Yes</is_done> when the translation is fully completed.

---

### Translation Workflow with XML Tags

1. **Step-by-Step Thinking (<thinking> XML Tag):**  
   - Break down the original text into its core components: main message, tone, context, and audience.  
   - Analyze linguistic and cultural elements to ensure appropriate adaptation in the target language.  

2. **Translation (<translation> XML Tag):**  
   - Provide the translation, maintaining technical precision, stylistic nuance, and contextual relevance.  

3. **Detailed Notes (<notes> XML Tag):**  
   - Explain key translation decisions, including challenges faced and choices made to address them.  
   - Highlight any cultural or contextual adaptations, as well as modifications to enhance readability or accuracy.  

4. **Completion Status (<is_done> XML Tag):**  
   - Use <is_done>No</is_done> to signal that the translation is ongoing.  
   - Use <is_done>Yes</is_done> to confirm the translation is fully complete.  
`;
        case "News/Journalistic Writing":
            return `### Translation Workflow

1. **Step-by-Step Thinking (<thinking> XML Tag):**

- Identify the **core message** and key facts in the original report.

- Understand the **cultural, political, and historical context** of the report.

- Plan the translation by considering differences in journalistic tone, terminology, and phrasing between the source and target languages.

2. **Translation (<translation> XML Tag):**

- Render the report in the target language, ensuring factual accuracy, linguistic clarity, and adherence to the norms of the target audience.

3. **Notes (<notes> XML Tag):**

- Explain translation decisions, such as adapting terms or phrases for clarity or cultural relevance.

- Address any challenges encountered, such as idiomatic expressions or culturally specific references, and justify the chosen solutions.

- Provide context for any necessary modifications or omissions to ensure that the report aligns with journalistic practices in the target language.

4. **Completion Status (<is_done> XML Tag):**

- Indicate if the translation is complete using <is_done>Yes</is_done>.

- Use <is_done>No</is_done> if the translation is incomplete and additional responses are required to finish.
`;
        case "Literary (Poetry or Prose)":
            return `### Translation Workflow

1. **Step-by-Step Thinking (<thinking> XML Tag):**

- Analyze the **original text's structure**, identifying literary devices, meter, rhythm, tone, and rhyme scheme (if applicable).

- Understand the **cultural, historical, and linguistic context** of the original text, paying close attention to idiomatic expressions, symbolism, and nuances.

- Plan how to adapt these features into the target language while maintaining fidelity to the original’s aesthetic and thematic richness.

2. **Translation (<translation> XML Tag):**

- Render the text into the target language with a focus on preserving its literary qualities, adapting the rhythm, meter, or rhyme to align with the target language's poetic and literary conventions.

- Ensure the translation is faithful to both the literal and figurative meanings of the original.

3. **Formal and Stylistic Exegesis (<exegesis_formal> XML Tag):**

- Discuss the **formal features** of the original text, such as its meter, rhyme scheme, imagery, and syntax.

- Justify how these were retained, adapted, or transformed in the translation to suit the target language.

4. **Deep and Thematic Exegesis (<exegesis_deep> XML Tag):**

- Explore the **deeper meanings, themes, and emotions** in the original text, explaining how these were preserved or reinterpreted in the translation.

- Provide a detailed critique of the source language’s richness, highlighting its literary and cultural nuances, and how they influenced the translation choices.

5. **Completion Status (<is_done> XML Tag):**

- Indicate if the translation is complete using <is_done>Yes</is_done>.

- Use <is_done>No</is_done> if the translation is incomplete and additional responses are required to finish.
`;
        case "Legal":
            return `### **Translation Workflow**  

#### **Step 1: Analysis (<thinking> XML Tag)**  
- Identify the type of legal document (e.g., FIR, property deed, judgment).  
- Analyse the document’s structure and content, noting sections, legal terms, and specific elements (e.g., dates, monetary figures, proper nouns).  
- Recognise cultural, linguistic, and legal nuances, ensuring they are reflected accurately in the translation.  
- Plan strategies to standardise the document into a format and tone suitable for formal legal proceedings in India.  

#### **Step 2: Translation (<translation> XML Tag)**  
- Translate the text into formal English using UK spelling and conventions, as required in Indian official contexts.  
- Maintain the legal tone and structure while ensuring clarity and precision.  
- Translate headings and sections clearly (e.g., "प्रथम सूचना रिपोर्ट" to "First Information Report").  
- Retain original names, places, dates, and monetary values without alteration, except for standardisation into English equivalents (e.g., ₹50,000 instead of 50,000 INR).  
- Adhere to document-specific requirements:  
   - **FIRs**: Include details such as the police station, complainant information, incident description, and monetary values in a clear and chronological manner.  
   - **Deeds/Agreements**: Use precise language to describe property, parties involved, and contractual obligations.  
   - **Judgments**: Provide a formal rendering of case summaries, legal reasoning, and judicial orders.  
   - **Affidavits**: Maintain a declarative tone while clearly affirming the legal declarations.  
   - **Certificates**: Translate the certificate details while preserving official structure and authenticity.  
   - **Ancient or Historical Legal Texts**: Use modern legal English while respecting the source language’s historical and legal context.  

#### **Step 3: Notes (<notes> XML Tag)**  
- Summarise the key points and structural changes made for clarity or legal standardisation.  
- Highlight any legal terms or concepts adapted into English equivalents, specifying the original terms.  
- Note retained original features (e.g., currency format, proper nouns).  
- Include comments on how linguistic or legal nuances were preserved or adapted.  

#### **Step 4: Task Completion (<is_done> XML Tag)**  
- Indicate task completion status with a "Yes" or "No" flag
`;
    }
};

// Main translation function
const performTranslation = async (
    systemPrompt: string,
    userPrompt: string,
): Promise<string> => {
    const fullResponse: string[] = [];
    let isDone = false;
    let assistantResponse = "";

    while (!isDone) {
        const messages = [
            {
                role: "system" as const,
                content: systemPrompt,
            },
            ...(assistantResponse
                ? [
                      {
                          role: "assistant" as const,
                          content: assistantResponse,
                      },
                  ]
                : []),
            {
                role: "user" as const,
                content: assistantResponse
                    ? "Please think step-by-step and continue translating with all relevant XML tags."
                    : userPrompt,
            },
        ];

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages,
                temperature: 1,
            });

            assistantResponse = response.choices[0]?.message.content ?? "";
            fullResponse.push(assistantResponse);
            isDone = parseIsDone(assistantResponse);
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to translate content",
            });
        }
    }

    return fullResponse.join("\n");
};

// Export the translation procedure
export const translateDocument = protectedProcedure
    .input(
        z.object({
            inputDocument: z.string().nullable(),
            chapters: z.array(z.string()).nullable(),
            documentType: z.enum([
                "Books, Academic Papers, and Technical Content",
                "News/Journalistic Writing",
                "Literary (Poetry or Prose)",
                "Legal",
            ]),
            targetLanguage: z.string(),
            documentId: z.string(),
        }),
    )
    .mutation(async ({ input, ctx }) => {
        try {
            const inputDocument =
                input.inputDocument ??
                input.chapters?.join("\n\n") ??
                "No Document Provided???";
            await ctx.db.insert(translationsDatabase).values({
                id: input.documentId,
                inputDoc: inputDocument,
                createdById: ctx.session.user.id,
                name: "Translating new Document",
            });

            const systemPrompt = getSystemPrompt(input.documentType);
            const translations: Record<string, string> = {};

            if (input.chapters && input.chapters.length > 0) {
                for (let i = 0; i < input.chapters.length; i++) {
                    const chapter = input.chapters[i];
                    if (!chapter?.trim()) continue;

                    let userPrompt = "";
                    if (i === 0) {
                        userPrompt = `Follow your instruction to think step-by-step and translate the following ${input.documentType} to ${input.targetLanguage} language. DO NOT write anything outside the XML tags. Ensure that the entire content is translated with the same length, without leaving out any sentences. DO NOT TRUNCATE OR SUMMARIZE! TRANSLATE FULLY:\n\n${chapter}`;
                    } else {
                        const prevTranslations = Object.entries(translations)
                            .map(
                                ([key, value]) =>
                                    `${key} Translation:\n${value}`,
                            )
                            .join("\n\n");

                        userPrompt = `Follow your instruction to think step-by-step and translate the next ${
                            input.documentType
                        } to ${
                            input.targetLanguage
                        } language. In your thought process and writing, make sure that there is consistency from the previous ${
                            i > 1 ? "chapters" : "chapter"
                        }. DO NOT write anything outside the XML tags. Ensure that the entire content is translated with the same length, without leaving out any sentences. DO NOT TRUNCATE OR SUMMARIZE! TRANSLATE FULLY:\n\n${prevTranslations}\n\nCurrent Chapter Text:\n${chapter}`;
                    }

                    const translationOutput = await performTranslation(
                        systemPrompt,
                        userPrompt,
                    );
                    translations[`Chapter ${i + 1}`] =
                        extractTranslation(translationOutput);
                }
            } else if (input.inputDocument) {
                const userPrompt = `Follow your instruction to think step-by-step and translate the following ${input.documentType} to ${input.targetLanguage} language. DO NOT write anything outside the XML tags. Ensure that the entire content is translated with the same length, without leaving out any sentences. DO NOT TRUNCATE OR SUMMARIZE! TRANSLATE FULLY:\n\n${input.inputDocument}`;
                const translationOutput = await performTranslation(
                    systemPrompt,
                    userPrompt,
                );
                translations.Document = extractTranslation(translationOutput);
            } else {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No content provided for translation",
                });
            }

            const title = getTranslationPreview(translations);

            await ctx.db
                .update(translationsDatabase)
                .set({
                    translatedDoc: combineTranslations(translations),
                    status: "completed",
                    name: title,
                })
                .where(eq(translationsDatabase.id, input.documentId));
        } catch (error) {
            await ctx.db
                .update(translationsDatabase)
                .set({
                    status: "failed",
                })
                .where(eq(translationsDatabase.id, input.documentId));
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Please try again",
            });
        }
    });

const combineTranslations = (translations: Record<string, string>): string => {
    return Object.entries(translations)
        .map(([chapter, content]) => `${chapter}\n\n${content}`)
        .join("\n\n---\n\n");
};

const getTranslationPreview = (
    translations: Record<string, string>,
): string => {
    const firstContent = Object.values(translations)[0];

    const lines = firstContent.split("\n").filter((line) => line.trim());
    const preview = lines.slice(0, 2).join(" "); // Get first 2 non-empty lines

    // Truncate if too long and add ellipsis
    const maxLength = 100;
    return preview.length > maxLength
        ? `${preview.slice(0, maxLength)}...`
        : `${preview}...`;
};
